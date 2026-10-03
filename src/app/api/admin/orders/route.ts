import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { genOrderNumber } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

const SOURCES = ["website", "facebook", "instagram", "tiktok", "whatsapp", "offline", "phone", "other"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Your login has expired. Please log in again." }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = normalizeWhatsAppPhone(String(body.customerPhone ?? ""));
  const customerAddress = String(body.customerAddress ?? "").trim();
  const city = String(body.city ?? "").trim() || null;
  const source = SOURCES.includes(body.source) ? body.source : "other";
  const paymentStatus = PAYMENT_STATUSES.includes(body.paymentStatus) ? body.paymentStatus : "pending";
  const discount = Math.max(0, Number(body.discount) || 0);
  const deliveryCharges = Math.max(0, Number(body.deliveryCharges) || 0);
  const notes = String(body.notes ?? "").trim() || null;
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((i: any) => ({
      productId: Number(i.productId) || null,
      type: i.type === "bundle" ? "bundle" : "product",
      name: String(i.name ?? "").trim(),
      price: Number(i.price),
      qty: Math.round(Number(i.qty)),
    }))
    .filter((i: any) => i.name && Number.isFinite(i.price) && i.price >= 0 && i.qty >= 1);

  if (!customerName || !customerPhone || !customerAddress) {
    return NextResponse.json({ error: "Customer name, phone and address are required." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Add at least one product with a quantity of 1 or more." }, { status: 400 });
  }

  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  if (discount > subtotal) return NextResponse.json({ error: "Discount cannot be more than the subtotal." }, { status: 400 });
  const total = subtotal - discount + deliveryCharges;
  const orderNumber = await genOrderNumber();
  const createdAt = new Date().toISOString();

  const [order] = await db.insert(orders).values({
    orderNumber, source, customerName, customerPhone, customerAddress, city,
    subtotal, discount, deliveryCharges, total,
    paymentMethod: "manual", paymentStatus, orderStatus: "confirmed",
    paymentDate: paymentStatus === "paid" ? createdAt : null,
    whatsappConfirmationStatus: "not_sent", notes, enteredByAdminId: Number(session.adminId) || null, createdAt,
  }).returning();

  for (const i of items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: i.type === "bundle" ? null : i.productId,
      bundleId: i.type === "bundle" ? i.productId : null,
      productNameSnapshot: i.name, quantity: i.qty, unitPrice: i.price,
    });
  }
  revalidatePath("/admin", "layout");
  return NextResponse.json({ id: order.id, orderNumber });
}
