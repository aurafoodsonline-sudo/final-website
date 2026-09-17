import { db } from "@/db";
import { orders } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function AdminDashboard() {
  const all = await db.select().from(orders);
  const totalOrders = all.length;
  const totalSales = all.reduce((s, o) => s + o.total, 0);
  const totalPaid = all.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
  const pending = all.filter((o) => o.paymentStatus === "pending").reduce((s, o) => s + o.total, 0);
  const cancelled = all.filter((o) => o.orderStatus === "cancelled").length;

  const bySource: Record<string, number> = {};
  for (const o of all) bySource[o.source] = (bySource[o.source] ?? 0) + o.total;

  const byMonth: Record<string, number> = {};
  for (const o of all) {
    const m = o.createdAt.slice(0, 7);
    byMonth[m] = (byMonth[m] ?? 0) + o.total;
  }

  const cards = [
    ["Total Orders", totalOrders],
    ["Total Sales", `Rs. ${totalSales.toLocaleString()}`],
    ["Total Paid", `Rs. ${totalPaid.toLocaleString()}`],
    ["Pending Payments", `Rs. ${pending.toLocaleString()}`],
    ["Cancelled Orders", cancelled],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heritage text-2xl">Central Sales Dashboard</h1>
        <a href="/admin/orders" className="text-sm underline">Date-range report & export →</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {cards.map(([label, value]) => (
          <div key={label as string} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs opacity-60">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Sales by Channel / Source</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(bySource).map(([src, val]) => (
                <tr key={src} className="border-b last:border-0">
                  <td className="py-1.5 capitalize">{src}</td>
                  <td className="py-1.5 text-right">Rs. {val.toLocaleString()}</td>
                </tr>
              ))}
              {totalOrders === 0 && <tr><td className="py-2 opacity-60">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Sales by Month</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(byMonth).map(([m, val]) => (
                <tr key={m} className="border-b last:border-0">
                  <td className="py-1.5">{m}</td>
                  <td className="py-1.5 text-right">Rs. {val.toLocaleString()}</td>
                </tr>
              ))}
              {totalOrders === 0 && <tr><td className="py-2 opacity-60">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
