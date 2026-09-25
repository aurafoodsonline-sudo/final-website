import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/request-origin";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES = ["pending", "confirmed", "cancellation_requested", "cancelled", "delivered"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const WHATSAPP_STATUSES = ["not_sent", "sent", "confirmed", "cancellation_requested", "no_response", "no_whatsapp"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = getPublicOrigin(req);
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id)));
  if (!order) return NextResponse.redirect(new URL("/admin/orders?error=Order%20not%20found", origin), 303);

  const fd = await req.formData();
  const pick = (key: string, allowed: string[]) => {
    const v = String(fd.get(key) ?? "");
    return allowed.includes(v) ? v : undefined;
  };
  const updates: Partial<typeof orders.$inferInsert> = {};
  const orderStatus = pick("orderStatus", ORDER_STATUSES);
  const paymentStatus = pick("paymentStatus", PAYMENT_STATUSES);
  const whatsapp = pick("whatsappConfirmationStatus", WHATSAPP_STATUSES);
  if (orderStatus) updates.orderStatus = orderStatus;
  if (paymentStatus) {
    updates.paymentStatus = paymentStatus;
    if (paymentStatus === "paid" && order.paymentStatus !== "paid") updates.paymentDate = new Date().toISOString();
    if (paymentStatus !== "paid") updates.paymentDate = null;
  }
  if (fd.has("transactionId")) updates.transactionId = String(fd.get("transactionId") ?? "").trim() || null;
  if (whatsapp && whatsapp !== order.whatsappConfirmationStatus) {
    updates.whatsappConfirmationStatus = whatsapp;
    updates.whatsappRespondedAt = new Date().toISOString();
  }
  if (fd.has("notes")) updates.notes = String(fd.get("notes") ?? "").trim() || null;

  if (Object.keys(updates).length) await db.update(orders).set(updates).where(eq(orders.id, order.id));
  revalidatePath("/admin", "layout");
  return NextResponse.redirect(new URL(`/admin/orders/${id}?ok=${encodeURIComponent("Order updated.")}`, origin), 303);
}
