import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

const SOURCES = ["website", "facebook", "instagram", "tiktok", "whatsapp", "offline", "phone", "other"];
const STATUSES = ["pending", "confirmed", "cancellation_requested", "cancelled", "delivered"];
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-turmeric/25", confirmed: "bg-cardamom/20 text-cardamom", delivered: "bg-cardamom text-white",
  cancelled: "bg-chili/15 text-chili", cancellation_requested: "bg-chili/15 text-chili",
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ source?: string; status?: string; q?: string }> }) {
  const { source, status, q } = await searchParams;
  const all = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const query = (q ?? "").trim().toLowerCase();
  const digits = query.replace(/\D/g, "");
  const filtered = all.filter((o) =>
    (!source || o.source === source) &&
    (!status || o.orderStatus === status) &&
    (!query ||
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      (digits.length >= 3 && o.customerPhone.includes(digits.replace(/^0/, ""))))
  );
  const link = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { source, status, q, ...params };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };
  const pill = (active: boolean) => `px-3 py-1 rounded-full border capitalize ${active ? "bg-chili text-white border-chili" : "bg-white"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="font-heritage text-2xl">Orders</h1>
        <Link href="/admin/orders/new" className="bg-chili text-white px-4 py-2 rounded-full text-sm">+ New Manual Order</Link>
      </div>

      <form className="flex flex-wrap gap-2 mb-4">
        {source && <input type="hidden" name="source" value={source} />}
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q ?? ""} placeholder="Search order #, name or phone" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 bg-white" />
        <button className="bg-cinnamon text-white px-4 py-2 rounded-full text-sm">Search</button>
        {(q || source || status) && <Link href="/admin/orders" className="px-4 py-2 text-sm underline">Clear filters</Link>}
      </form>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="opacity-60 w-14">Status:</span>
          <Link href={link({ status: undefined })} className={pill(!status)}>All</Link>
          {STATUSES.map((s) => <Link key={s} href={link({ status: s })} className={pill(status === s)}>{s.replace(/_/g, " ")}</Link>)}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="opacity-60 w-14">Source:</span>
          <Link href={link({ source: undefined })} className={pill(!source)}>All</Link>
          {SOURCES.map((s) => <Link key={s} href={link({ source: s })} className={pill(source === s)}>{s}</Link>)}
        </div>
      </div>

      <p className="text-xs opacity-60 mb-2">{filtered.length} order{filtered.length === 1 ? "" : "s"} · click a row's order number to open it</p>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cinnamon/5 text-left">
            <tr>
              <th className="p-3">Order #</th><th className="p-3">Customer</th><th className="p-3">Source</th>
              <th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th>
              <th className="p-3">WhatsApp</th><th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t hover:bg-cinnamon/5">
                <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-chili underline font-medium">{o.orderNumber}</Link></td>
                <td className="p-3">{o.customerName}<br /><span className="text-xs opacity-60">{o.customerPhone}</span></td>
                <td className="p-3 capitalize">{o.source}</td>
                <td className="p-3 whitespace-nowrap">Rs. {o.total}</td>
                <td className="p-3 capitalize">{o.paymentStatus}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs capitalize whitespace-nowrap ${STATUS_STYLE[o.orderStatus] ?? ""}`}>{o.orderStatus.replace(/_/g, " ")}</span></td>
                <td className="p-3 capitalize">{o.whatsappConfirmationStatus.replace(/_/g, " ")}</td>
                <td className="p-3 whitespace-nowrap">{o.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="p-4 opacity-60" colSpan={8}>No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
