import Link from "next/link";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";
import { packagingRecords, finishedGoodsBatches } from "@/db/schema";
import { linkOrderItemToPackaging } from "@/lib/admin-actions";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id) || 0));
  if (!order) return notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const allPackaging = await db.select().from(packagingRecords);
  const allBatches = await db.select().from(finishedGoodsBatches);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm underline print:hidden">← Back to orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2 mb-4 print:hidden">
        <h1 className="font-heritage text-2xl">Order {order.orderNumber}</h1>
        <div className="flex gap-2">
          <a href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Assalam-o-Alaikum ${order.customerName}, this is Aura Foods about your order #${order.orderNumber}.`)}`} target="_blank" rel="noreferrer" className="bg-cardamom text-white px-4 py-2 rounded-full text-sm">WhatsApp customer</a>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6" id="invoice">
        <div className="flex items-center gap-2 mb-4">
          <img src="/images/logo.jpg" className="w-10 h-10 rounded-full" alt="Aura Foods" />
          <div><p className="font-heritage text-lg">Aura Foods</p><p className="text-xs opacity-60">Crafted for Pure Taste — Invoice</p></div>
        </div>
        <p className="text-sm mb-1"><b>Order #:</b> {order.orderNumber}</p>
        <p className="text-sm mb-1"><b>Date:</b> {order.createdAt.slice(0, 10)}</p>
        <p className="text-sm mb-1"><b>Source:</b> {order.source}</p>
        <p className="text-sm mb-1"><b>Customer:</b> {order.customerName} — {order.customerPhone}</p>
        {order.customerEmail && <p className="text-sm mb-1"><b>Email:</b> {order.customerEmail}</p>}
        <p className="text-sm mb-3"><b>Address:</b> {order.customerAddress}{order.city ? `, ${order.city}` : ""}</p>
        <table className="w-full text-sm mb-3">
          <thead><tr className="border-b text-left"><th className="py-1">Product</th><th className="py-1">Qty</th><th className="py-1 text-right">Price</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b"><td className="py-1">{i.productNameSnapshot}{i.bundleId ? " (Bundle)" : ""}</td><td className="py-1">{i.quantity} × Rs. {i.unitPrice}</td><td className="py-1 text-right">Rs. {i.unitPrice * i.quantity}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="text-sm ml-auto w-48">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {order.subtotal}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>-Rs. {order.discount}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>Rs. {order.deliveryCharges}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>Rs. {order.total}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm print:hidden">
        <h2 className="font-semibold mb-3">Order & Payment Status</h2>
        <p className="text-sm mb-2">Payment Method: <b>{order.paymentMethod}</b> {order.transactionId ? `· Txn: ${order.transactionId}` : ""}</p>
        <p className="text-sm mb-4">WhatsApp Confirmation: <b className="capitalize">{order.whatsappConfirmationStatus.replace(/_/g, " ")}</b> {order.whatsappRespondedAt ? `(responded ${order.whatsappRespondedAt.slice(0, 16)})` : ""}</p>

        <form action={`/api/admin/orders/${order.id}`} method="post" className="grid grid-cols-2 gap-3 max-w-md">
          <label className="text-sm">Order Status
            <select name="orderStatus" defaultValue={order.orderStatus} className="border rounded-lg px-2 py-1.5 w-full mt-1">
              {["pending", "confirmed", "cancellation_requested", "cancelled", "delivered"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label className="text-sm">Payment Status
            <select name="paymentStatus" defaultValue={order.paymentStatus} className="border rounded-lg px-2 py-1.5 w-full mt-1">
              {["pending", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-sm col-span-2">Transaction ID
            <input name="transactionId" defaultValue={order.transactionId ?? ""} className="border rounded-lg px-2 py-1.5 w-full mt-1" />
          </label>
          <label className="text-sm col-span-2">WhatsApp Confirmation Status
            <select name="whatsappConfirmationStatus" defaultValue={order.whatsappConfirmationStatus} className="border rounded-lg px-2 py-1.5 w-full mt-1">
              {["not_sent", "sent", "confirmed", "cancellation_requested", "no_response", "no_whatsapp"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </label>
          <label className="text-sm col-span-2">Internal notes
            <textarea name="notes" defaultValue={order.notes ?? ""} rows={2} className="border rounded-lg px-2 py-1.5 w-full mt-1" />
          </label>
          <button className="bg-chili text-white px-5 py-2 rounded-full col-span-2 w-fit">Save changes</button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mt-6 print:hidden">
        <h2 className="font-semibold mb-1">Stock Fulfilment <span className="font-normal text-xs opacity-60">(optional)</span></h2>
        <p className="text-xs opacity-60 mb-3">Choose which packaging batch each item was packed from. This powers Batch Traceability.</p>
        {items.filter((i) => !i.productId).length === items.length && <p className="text-sm opacity-60">Bundles can't be linked to a batch.</p>}
        {items.filter((i) => i.productId).map((i) => {
          const productPackaging = allPackaging.filter((p) => p.productId === i.productId);
          const linkedBatch = i.packagingRecordId ? allPackaging.find((p) => p.id === i.packagingRecordId) : null;
          return (
            <form action={linkOrderItemToPackaging} key={i.id} className="flex flex-wrap items-center gap-2 text-sm mb-2">
              <input type="hidden" name="itemId" value={i.id} />
              <input type="hidden" name="orderId" value={order.id} />
              <span className="w-40 truncate">{i.productNameSnapshot}</span>
              <select name="packagingRecordId" defaultValue={i.packagingRecordId ?? ""} className="border rounded-lg px-2 py-1.5 flex-1">
                <option value="">{productPackaging.length ? "Not linked" : "No packaging batches for this product yet"}</option>
                {productPackaging.map((p) => (
                  <option key={p.id} value={p.id}>{allBatches.find((b) => b.id === p.finishedGoodsBatchId)?.batchNumber} ({p.packSizeGrams}g × {p.packetsProduced})</option>
                ))}
              </select>
              <button className="text-chili underline">{linkedBatch ? "Update" : "Link"}</button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
