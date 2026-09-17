import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const filtered = source ? all.filter((o) => o.source === source) : all;
  const sources = ["website", "facebook", "instagram", "tiktok", "whatsapp", "offline", "phone", "other"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heritage text-2xl">Orders</h1>
        <Link href="/admin/orders/new" className="bg-chili text-white px-4 py-2 rounded-full text-sm">+ Manual Order</Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap text-sm">
        <Link href="/admin/orders" className={`px-3 py-1 rounded-full border ${!source ? "bg-chili text-white" : ""}`}>All</Link>
        {sources.map((s) => (
          <Link key={s} href={`/admin/orders?source=${s}`} className={`px-3 py-1 rounded-full border capitalize ${source === s ? "bg-chili text-white" : ""}`}>{s}</Link>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cinnamon/5 text-left">
            <tr>
              <th className="p-3">Order #</th><th className="p-3">Customer</th><th className="p-3">Source</th>
              <th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th>
              <th className="p-3">WhatsApp</th><th className="p-3">Date</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.orderNumber}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3 capitalize">{o.source}</td>
                <td className="p-3">Rs. {o.total}</td>
                <td className="p-3 capitalize">{o.paymentStatus}</td>
                <td className="p-3 capitalize">{o.orderStatus}</td>
                <td className="p-3 capitalize">{o.whatsappConfirmationStatus.replace(/_/g, " ")}</td>
                <td className="p-3">{o.createdAt.slice(0, 10)}</td>
                <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-chili underline">View</Link></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="p-4 opacity-60" colSpan={9}>No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
