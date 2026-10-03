import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const phone = normalizeWhatsAppPhone(searchParams.get("phone") ?? "");
  const [order] = await db.select().from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.customerPhone, phone)));
  if (!order) return NextResponse.json({ error: "No matching order found." }, { status: 404 });
  return NextResponse.json({
    orderNumber: order.orderNumber, orderStatus: order.orderStatus, paymentStatus: order.paymentStatus,
    whatsappConfirmationStatus: order.whatsappConfirmationStatus, total: order.total, createdAt: order.createdAt,
  });
}
