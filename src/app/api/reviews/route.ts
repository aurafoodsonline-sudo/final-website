import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, orders, orderItems } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getPublicOrigin, getRefererPath } from "@/lib/request-origin";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const productId = Number(fd.get("productId"));
  const customerName = String(fd.get("customerName") ?? "").trim();
  const customerEmail = String(fd.get("customerEmail") ?? "").trim().toLowerCase();
  const rating = Math.min(5, Math.max(1, Math.round(Number(fd.get("rating")) || 5)));
  const bodyText = String(fd.get("body") ?? "").trim();

  const origin = getPublicOrigin(req);
  const back = getRefererPath(req, "/en/shop");
  const redirectWith = (status: string) => NextResponse.redirect(new URL(`${back}?review=${status}#reviews`, origin), 303);

  if (!productId || !customerName || !customerEmail || !bodyText) return redirectWith("missing");

  // Verified Purchase gate: Email -> Order -> Product.
  const matchingOrders = await db.select().from(orders).where(sql`lower(${orders.customerEmail}) = ${customerEmail}`);
  let verifiedOrderId: number | null = null;
  for (const o of matchingOrders) {
    const items = await db.select().from(orderItems).where(and(eq(orderItems.orderId, o.id), eq(orderItems.productId, productId)));
    if (items.length > 0) { verifiedOrderId = o.id; break; }
  }
  if (!verifiedOrderId) return redirectWith("unverified");

  await db.insert(reviews).values({
    productId, customerName, customerEmail, rating, body: bodyText,
    verifiedOrderId, status: "pending", createdAt: new Date().toISOString(),
  });
  return redirectWith("thanks");
}
