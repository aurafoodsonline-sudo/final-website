import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));
  const { id } = await params;
  const fd = await req.formData();
  const updates: Record<string, any> = {};
  if (fd.get("orderStatus")) updates.orderStatus = fd.get("orderStatus");
  if (fd.get("paymentStatus")) updates.paymentStatus = fd.get("paymentStatus");
  if (fd.get("transactionId")) updates.transactionId = fd.get("transactionId");
  if (fd.get("whatsappConfirmationStatus")) {
    updates.whatsappConfirmationStatus = fd.get("whatsappConfirmationStatus");
    updates.whatsappRespondedAt = new Date().toISOString();
  }
  if (updates.paymentStatus === "paid") updates.paymentDate = new Date().toISOString();
  await db.update(orders).set(updates).where(eq(orders.id, Number(id)));
  return NextResponse.redirect(new URL(`/admin/orders/${id}`, req.url));
}
