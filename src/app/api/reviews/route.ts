import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, orders, orderItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const fd = await req.formData();
  const productId = Number(fd.get("productId"));
  const customerName = String(fd.get("customerName") ?? "");
  const customerEmail = String(fd.get("customerEmail") ?? "");
  const rating = Number(fd.get("rating"));
  const bodyText = String(fd.get("body") ?? "");

  // Verified Purchase gate (Section 12): Email -> Order -> Product.
  const matchingOrders = await db.select().from(orders).where(eq(orders.customerEmail, customerEmail));
  let verifiedOrderId: number | null = null;
  for (const o of matchingOrders) {
    const items = await db.select().from(orderItems).where(and(eq(orderItems.orderId, o.id), eq(orderItems.productId, productId)));
    if (items.length > 0) { verifiedOrderId = o.id; break; }
  }

  const url = new URL(req.url);
  if (!verifiedOrderId) {
    return NextResponse.redirect(new URL(`/en/product/unverified?error=no_verified_purchase`, url.origin));
  }

  await db.insert(reviews).values({
    productId, customerName, customerEmail, rating, body: bodyText,
    verifiedOrderId, status: "pending", createdAt: new Date().toISOString(),
  });

  return NextResponse.redirect(new URL(req.headers.get("referer") ?? "/en", url.origin));
}
