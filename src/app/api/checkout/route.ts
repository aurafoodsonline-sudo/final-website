import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, bundles } from "@/db/schema";
import { genOrderNumber } from "@/lib/data";
import { normalizeWhatsAppPhone, sendWhatsAppAdminAlert, sendWhatsAppOrderConfirmation } from "@/lib/whatsapp";
import { parseGrammageOptions } from "@/lib/grammage";
import { deliveryChargeFor, WHOLESALE_VARIANT } from "@/lib/pricing";
import { eq } from "drizzle-orm";

type IncomingItem = { productId?: unknown; qty?: unknown; variant?: unknown; type?: unknown };
type PricedItem = { productId: number | null; bundleId: number | null; name: string; price: number; qty: number };

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const customerName = String(body.customerName ?? "").trim();
  const customerAddress = String(body.customerAddress ?? "").trim();
  const city = String(body.city ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase() || null;
  const paymentMethod = String(body.paymentMethod ?? "cod");
  const normalizedPhone = normalizeWhatsAppPhone(String(body.customerPhone ?? ""));
  const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];

  if (!customerName || !customerAddress || !city || items.length === 0) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }
  if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
    return NextResponse.json({ error: "Please enter a valid phone number, e.g. 0300 1234567." }, { status: 400 });
  }
  if (paymentMethod !== "cod") {
    return NextResponse.json({ error: "Please select a supported payment method." }, { status: 400 });
  }

  // Prices always come from the database — never from the browser.
  const priced: PricedItem[] = [];
  for (const item of items) {
    const id = Number(item.productId);
    const qty = Math.round(Number(item.qty));
    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ error: "Your cart has an invalid item. Please refresh the cart and try again." }, { status: 400 });
    }

    if (item.type === "bundle") {
      const [b] = await db.select().from(bundles).where(eq(bundles.id, id));
      if (!b || b.isHidden) return NextResponse.json({ error: "A bundle in your cart is no longer available. Please remove it and try again." }, { status: 400 });
      if (b.websiteStockStatus === "out_of_stock") return NextResponse.json({ error: `${b.nameEn} is currently out of stock.` }, { status: 400 });
      priced.push({ productId: null, bundleId: b.id, name: b.nameEn, price: b.price, qty });
      continue;
    }

    const [p] = await db.select().from(products).where(eq(products.id, id));
    if (!p || p.isHidden) return NextResponse.json({ error: "A product in your cart is no longer available. Please remove it and try again." }, { status: 400 });
    if (p.websiteStockStatus === "out_of_stock") return NextResponse.json({ error: `${p.nameEn} is currently out of stock.` }, { status: 400 });

    const variant = typeof item.variant === "string" ? item.variant : "";
    if (variant === WHOLESALE_VARIANT) {
      if (!p.wholesaleEligible || !p.wholesalePrice) return NextResponse.json({ error: `${p.nameEn} is not available for wholesale.` }, { status: 400 });
      priced.push({ productId: p.id, bundleId: null, name: `${p.nameEn} (${WHOLESALE_VARIANT})`, price: p.wholesalePrice, qty });
      continue;
    }
    const options = parseGrammageOptions(p.grammageOptions, p.weightLabel, p.price);
    const option = options.find((o) => o.label === variant) ?? options[0];
    priced.push({ productId: p.id, bundleId: null, name: `${p.nameEn} (${option.label})`, price: option.price, qty });
  }

  const subtotal = priced.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryCharges = deliveryChargeFor(subtotal);
  const total = subtotal + deliveryCharges;
  const orderNumber = await genOrderNumber();
  const createdAt = new Date().toISOString();

  const [order] = await db.insert(orders).values({
    orderNumber, source: "website", customerName, customerPhone: normalizedPhone, customerEmail, customerAddress, city,
    subtotal, deliveryCharges, total, paymentMethod,
    paymentStatus: "pending", orderStatus: "pending",
    whatsappConfirmationStatus: "not_sent", createdAt,
  }).returning();

  for (const i of priced) {
    await db.insert(orderItems).values({
      orderId: order.id, productId: i.productId, bundleId: i.bundleId, productNameSnapshot: i.name, quantity: i.qty, unitPrice: i.price,
    });
  }

  const itemsText = priced.map((i) => `${i.name} x${i.qty}`).join("\n");
  const wa = await sendWhatsAppOrderConfirmation({
    orderNumber, customerName, customerPhone: normalizedPhone, itemsText, subtotal, deliveryCharges, total, paymentMethod, customerAddress, createdAt,
  });
  await db.update(orders).set({
    whatsappConfirmationStatus: wa.status,
    whatsappSentAt: wa.status === "sent" ? createdAt : null,
    notes: wa.status === "sent" ? order.notes : `WhatsApp: ${"reason" in wa && wa.reason ? wa.reason : "stub" in wa ? "not configured yet (no WhatsApp credentials)" : "automation is turned off"}`,
  }).where(eq(orders.id, order.id));
  const adminAlert = await sendWhatsAppAdminAlert({ orderNumber, customerName, customerPhone: normalizedPhone, total, itemsText });

  return NextResponse.json({
    orderNumber,
    customerPhone: normalizedPhone,
    total,
    whatsappStatus: wa.status,
    adminWhatsAppStatus: adminAlert.status,
  });
}
