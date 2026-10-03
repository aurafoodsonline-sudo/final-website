import Link from "next/link";
import { db } from "@/db";
import { orders, reviews } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const rs = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

export default async function AdminDashboard() {
  const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const pendingReviews = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.status, "pending"));

  // Cancelled orders are counted separately and never included in sales totals.
  const active = all.filter((o) => o.orderStatus !== "cancelled");
  const totalSales = active.reduce((s, o) => s + o.total, 0);
  const totalPaid = active.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
  const pendingPayments = active.filter((o) => o.paymentStatus === "pending").reduce((s, o) => s + o.total, 0);
  const cancelled = all.length - active.length;
  const newOrders = all.filter((o) => o.orderStatus === "pending" || o.orderStatus === "cancellation_requested");

  const bySource: Record<string, number> = {};
  for (const o of active) bySource[o.source] = (bySource[o.source] ?? 0) + o.total;
  const byMonth: Record<string, number> = {};
  for (const o of active) {
    const m = o.createdAt.slice(0, 7);
    byMonth[m] = (byMonth[m] ?? 0) + o.total;
  }

  const cards: [string, string | number][] = [
    ["Total Orders", all.length],
    ["Total Sales", rs(totalSales)],
    ["Total Paid", rs(totalPaid)],
    ["Pending Payments", rs(pendingPayments)],
    ["Cancelled Orders", cancelled],
  ];

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Dashboard</h1>

      {(newOrders.length > 0 || pendingReviews.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {newOrders.length > 0 && (
            <Link href="/admin/orders?status=pending" className="bg-chili text-white rounded-xl px-4 py-3 text-sm shadow-sm">
              <b>{newOrders.length}</b> order{newOrders.length === 1 ? "" : "s"} waiting for confirmation →
            </Link>
          )}
          {pendingReviews.length > 0 && (
            <Link href="/admin/reviews" className="bg-turmeric text-white rounded-xl px-4 py-3 text-sm shadow-sm">
              <b>{pendingReviews.length}</b> review{pendingReviews.length === 1 ? "" : "s"} to approve →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs opacity-60">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Latest Orders</h2>
          <Link href="/admin/orders" className="text-sm text-chili underline">See all orders →</Link>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {all.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-2"><Link href={`/admin/orders/${o.id}`} className="text-chili underline">{o.orderNumber}</Link></td>
                <td className="py-2">{o.customerName}</td>
                <td className="py-2 capitalize">{o.orderStatus.replace(/_/g, " ")}</td>
                <td className="py-2 text-right">{rs(o.total)}</td>
              </tr>
            ))}
            {all.length === 0 && <tr><td className="py-2 opacity-60">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Sales by Channel / Source</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(bySource).map(([src, val]) => (
                <tr key={src} className="border-b last:border-0">
                  <td className="py-1.5 capitalize">{src}</td>
                  <td className="py-1.5 text-right">{rs(val)}</td>
                </tr>
              ))}
              {active.length === 0 && <tr><td className="py-2 opacity-60">No sales yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Sales by Month</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).map(([m, val]) => (
                <tr key={m} className="border-b last:border-0">
                  <td className="py-1.5">{m}</td>
                  <td className="py-1.5 text-right">{rs(val)}</td>
                </tr>
              ))}
              {active.length === 0 && <tr><td className="py-2 opacity-60">No sales yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
