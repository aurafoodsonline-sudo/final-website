import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { moderateReview } from "@/lib/admin-actions";

export default async function ReviewsPage() {
  const all = await db.select().from(reviews).orderBy(desc(reviews.id));
  const allProducts = await db.select().from(products);

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Customer Reviews Moderation</h1>
      <div className="space-y-3">
        {all.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-medium">{r.customerName}</span>{" "}
                <span className="text-turmeric">{"★".repeat(r.rating)}</span>{" "}
                <span className="text-xs bg-cardamom/20 text-cardamom px-2 py-0.5 rounded-full">Verified Purchase (order #{r.verifiedOrderId})</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "approved" ? "bg-cardamom/30" : r.status === "rejected" ? "bg-chili/20 text-chili" : "bg-turmeric/30"}`}>{r.status}</span>
            </div>
            <p className="text-sm opacity-60 mb-1">Product: {allProducts.find((p) => p.id === r.productId)?.nameEn}</p>
            <p className="text-sm mb-3">{r.body}</p>
            <div className="flex gap-2 text-sm">
              <form action={moderateReview}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value="approved" /><button className="bg-cardamom text-white px-3 py-1 rounded-full">Approve</button></form>
              <form action={moderateReview}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value="rejected" /><button className="bg-turmeric text-white px-3 py-1 rounded-full">Reject</button></form>
              <form action={moderateReview}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="action" value="delete" /><button className="bg-chili text-white px-3 py-1 rounded-full">Delete</button></form>
            </div>
          </div>
        ))}
        {all.length === 0 && <p className="opacity-60">No reviews submitted yet.</p>}
      </div>
    </div>
  );
}
