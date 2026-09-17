import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { genOrderNumber } from "@/lib/data";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { source, customerName, customerPhone, customerAddress, items, discount, deliveryCharges, paymentStatus, notes } = body;

  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const total = subtotal - (Number(discount) || 0) + (Number(deliveryCharges) || 0);
  const orderNumber = genOrderNumber();
  const createdAt = new Date().toISOString();

  const [order] = await db.insert(orders).values({
    orderNumber, source, customerName, customerPhone, customerAddress,
    subtotal, discount: Number(discount) || 0, deliveryCharges: Number(deliveryCharges) || 0, total,
    paymentMethod: "manual", paymentStatus: paymentStatus || "pending", orderStatus: "confirmed",
    whatsappConfirmationStatus: "not_sent", notes, enteredByAdminId: session.adminId as number, createdAt,
  }).returning();

  for (const i of items) {
    await db.insert(orderItems).values({ orderId: order.id, productId: i.productId ?? null, productNameSnapshot: i.name, quantity: i.qty, unitPrice: i.price });
  }

  return NextResponse.json({ id: order.id, orderNumber });
}
