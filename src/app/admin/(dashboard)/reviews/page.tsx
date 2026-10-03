import Link from "next/link";
import { db } from "@/db";
import { reviews, products, orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import { moderateReview } from "@/lib/admin-actions";

const TABS = ["pending", "approved", "rejected", "all"] as const;

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const tab = (TABS as readonly string[]).includes(show ?? "") ? show! : "pending";
  const all = await db.select().from(reviews).orderBy(desc(reviews.id));
  const allProducts = await db.select({ id: products.id, nameEn: products.nameEn, slug: products.slug }).from(products);
  const allOrders = await db.select({ id: orders.id, orderNumber: orders.orderNumber }).from(orders);
  const list = tab === "all" ? all : all.filter((r) => r.status === tab);

  const button = (id: number, action: string, label: string, cls: string) => (
    <form action={moderateReview}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={action} />
      <button className={`${cls} text-white px-3 py-1 rounded-full`}>{label}</button>
    </form>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="font-heritage text-2xl mb-1">Customer Reviews</h1>
      <p className="text-sm opacity-70 mb-4">Only reviews you approve are shown on the website. Every review comes from a verified order.</p>
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {TABS.map((t) => {
          const count = t === "all" ? all.length : all.filter((r) => r.status === t).length;
          return <Link key={t} href={`/admin/reviews?show=${t}`} className={`px-3 py-1 rounded-full border capitalize ${tab === t ? "bg-chili text-white border-chili" : "bg-white"}`}>{t} ({count})</Link>;
        })}
      </div>
      <div className="space-y-3">
        {list.map((r) => {
          const product = allProducts.find((p) => p.id === r.productId);
          return (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div>
                  <span className="font-medium">{r.customerName}</span>{" "}
                  <span className="text-turmeric">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${r.status === "approved" ? "bg-cardamom/30" : r.status === "rejected" ? "bg-chili/20 text-chili" : "bg-turmeric/30"}`}>{r.status}</span>
              </div>
              <p className="text-xs opacity-60 mb-2">
                {product ? product.nameEn : "Deleted product"} · order {allOrders.find((o) => o.id === r.verifiedOrderId)?.orderNumber ?? `#${r.verifiedOrderId}`} · {r.customerEmail} · {r.createdAt.slice(0, 10)}
              </p>
              <p className="text-sm mb-3 whitespace-pre-line">{r.body}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {r.status !== "approved" && button(r.id, "approved", "Approve", "bg-cardamom")}
                {r.status !== "rejected" && button(r.id, "rejected", "Reject", "bg-turmeric")}
                {button(r.id, "delete", "Delete", "bg-chili")}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="opacity-60">No {tab === "all" ? "" : tab} reviews.</p>}
      </div>
    </div>
  );
}
