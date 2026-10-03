import { db } from "@/db";
import { finishedGoodsBatches, processingRecords } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function FinishedGoodsPage() {
  const batches = await db.select().from(finishedGoodsBatches).orderBy(desc(finishedGoodsBatches.id));
  return (
    <div>
      <h1 className="font-heritage text-2xl mb-2">Finished Goods / Powder Stock</h1>
      <p className="text-sm opacity-70 mb-4">Created automatically when a processing record is saved (Section 6). Remaining quantity decreases as packaging records consume it.</p>
      <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="p-2">Batch #</th><th className="p-2">Product</th><th className="p-2">Final Powder Qty</th><th className="p-2">Remaining</th><th className="p-2">Processing Cost</th><th className="p-2">Created</th></tr></thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-2">{b.batchNumber}</td>
                <td className="p-2">{b.productNameLabel}</td>
                <td className="p-2">{b.finalPowderQty} kg</td>
                <td className="p-2 font-medium">{b.remainingQty.toFixed(2)} kg</td>
                <td className="p-2">Rs. {b.processingCost}</td>
                <td className="p-2">{b.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
            {batches.length === 0 && <tr><td className="p-2 opacity-60" colSpan={6}>No finished-goods batches yet — create a processing record first.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
