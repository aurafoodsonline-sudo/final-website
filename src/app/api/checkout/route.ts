import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { genOrderNumber } from "@/lib/data";
import { normalizeWhatsAppPhone, sendWhatsAppAdminAlert, sendWhatsAppOrderConfirmation } from "@/lib/whatsapp";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerPhone, customerAddress, city, paymentMethod, items } = body;
  const normalizedPhone = normalizeWhatsAppPhone(String(customerPhone));

  if (!customerName || !normalizedPhone || !customerAddress || !items?.length) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Order-time stock validation (Section 10) — website availability is admin-controlled,
  // but we still block ordering something explicitly marked Out of Stock.
  for (const item of items) {
    const [p] = await db.select().from(products).where(eq(products.id, item.productId));
    if (p && p.websiteStockStatus === "out_of_stock") {
      return NextResponse.json({ error: `${p.nameEn} is currently out of stock.` }, { status: 400 });
    }
  }

  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.qty, 0);
  const deliveryCharges = subtotal > 0 && subtotal < 1500 ? 150 : 0;
  const total = subtotal + deliveryCharges;
  const orderNumber = genOrderNumber();
  const createdAt = new Date().toISOString();

  const [order] = await db.insert(orders).values({
    orderNumber, source: "website", customerName, customerPhone: normalizedPhone, customerAddress, city,
    subtotal, deliveryCharges, total, paymentMethod,
    paymentStatus: "pending", orderStatus: "pending",
    whatsappConfirmationStatus: "not_sent", createdAt,
  }).returning();

  for (const i of items) {
    await db.insert(orderItems).values({
      orderId: order.id, productId: i.productId, productNameSnapshot: i.name, quantity: i.qty, unitPrice: i.price,
    });
  }

  const itemsText = items.map((i: any) => `${i.name} x${i.qty}`).join("\n");
  const wa = await sendWhatsAppOrderConfirmation({
    orderNumber, customerName, customerPhone: normalizedPhone, itemsText, subtotal, deliveryCharges, total, paymentMethod, customerAddress, createdAt,
  });
  await db.update(orders).set({ whatsappConfirmationStatus: wa.status, whatsappSentAt: wa.status === "sent" ? createdAt : null }).where(eq(orders.id, order.id));
  await sendWhatsAppAdminAlert({ orderNumber, customerName, customerPhone: normalizedPhone, total, itemsText });

  return NextResponse.json({ orderNumber, customerPhone: normalizedPhone, whatsappStatus: wa.status });
}
