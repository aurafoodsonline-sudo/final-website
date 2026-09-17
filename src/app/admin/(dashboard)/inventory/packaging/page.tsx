import { db } from "@/db";
import { finishedGoodsBatches, products, packagingRecords } from "@/db/schema";
import { desc } from "drizzle-orm";
import { createPackagingRecord } from "@/lib/admin-actions";

const PACK_SIZES = [50, 100, 150, 200, 250, 500, 1000];

export default async function PackagingPage() {
  const batches = await db.select().from(finishedGoodsBatches);
  const allProducts = await db.select().from(products);
  const records = await db.select().from(packagingRecords).orderBy(desc(packagingRecords.id));

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Finished Goods → Packaging</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3">New Packaging Record</h2>
          <form action={createPackagingRecord} className="grid gap-2">
            <select name="finishedGoodsBatchId" required className="border rounded-lg px-3 py-2">
              {batches.map((b) => <option key={b.id} value={b.id}>{b.batchNumber} — {b.productNameLabel} ({b.remainingQty.toFixed(1)} kg left)</option>)}
            </select>
            <select name="productId" required className="border rounded-lg px-3 py-2">
              {allProducts.map((p) => <option key={p.id} value={p.id}>{p.nameEn} ({p.weightLabel})</option>)}
            </select>
            <input type="date" name="packagingDate" required className="border rounded-lg px-3 py-2" />
            <select name="packSizeGrams" required className="border rounded-lg px-3 py-2">
              {PACK_SIZES.map((s) => <option key={s} value={s}>{s >= 1000 ? `${s / 1000}kg` : `${s}g`}</option>)}
            </select>
            <input type="number" name="packetsProduced" placeholder="Packets Produced" required className="border rounded-lg px-3 py-2" />
            <p className="text-xs opacity-60">Powder used and remaining finished-goods stock are calculated automatically. This also increments the product's internal stock count only — website availability is unaffected (Section 10).</p>
            <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save Packaging Record</button>
          </form>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
          <h2 className="font-semibold mb-3 px-2">Packaging Records</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Batch</th><th className="p-2">Product</th><th className="p-2">Pack Size</th><th className="p-2">Packets</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{batches.find((b) => b.id === r.finishedGoodsBatchId)?.batchNumber}</td>
                  <td className="p-2">{allProducts.find((p) => p.id === r.productId)?.nameEn}</td>
                  <td className="p-2">{r.packSizeGrams >= 1000 ? `${r.packSizeGrams / 1000}kg` : `${r.packSizeGrams}g`}</td>
                  <td className="p-2">{r.packetsProduced}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td className="p-2 opacity-60" colSpan={4}>No packaging records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
