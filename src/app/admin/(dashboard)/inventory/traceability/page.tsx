import { db } from "@/db";
import { processingRecords, finishedGoodsBatches, packagingRecords, rawMaterials, suppliers, rawMaterialPurchases, products, orderItems, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function TraceabilityPage({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  const { batch } = await searchParams;
  const allBatches = await db.select().from(finishedGoodsBatches);
  let detail: any = null;

  if (batch) {
    const [fg] = await db.select().from(finishedGoodsBatches).where(eq(finishedGoodsBatches.batchNumber, batch));
    if (fg) {
      const [proc] = await db.select().from(processingRecords).where(eq(processingRecords.id, fg.processingRecordId));
      const material = proc ? (await db.select().from(rawMaterials).where(eq(rawMaterials.id, proc.rawMaterialId)))[0] : null;
      const supplier = proc?.supplierId ? (await db.select().from(suppliers).where(eq(suppliers.id, proc.supplierId)))[0] : null;
      const packaging = await db.select().from(packagingRecords).where(eq(packagingRecords.finishedGoodsBatchId, fg.id));
      let totalPacketsSold = 0;
      const soldIn: string[] = [];
      for (const pkg of packaging) {
        const items = await db.select().from(orderItems).where(eq(orderItems.packagingRecordId, pkg.id));
        for (const it of items) {
          totalPacketsSold += it.quantity;
          const [o] = await db.select().from(orders).where(eq(orders.id, it.orderId));
          if (o) soldIn.push(o.orderNumber);
        }
      }
      detail = { fg, proc, material, supplier, packaging, totalPacketsSold, soldIn };
    }
  }

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Complete Stock Movement Tracking</h1>
      <p className="text-sm opacity-70 mb-4">Purchase → Raw Material Stock → Grinding/Processing → Wastage → Finished Powder → Packaging → Sale.</p>
      <form className="mb-6 flex flex-wrap gap-2">
        <select name="batch" defaultValue={batch ?? ""} className="border rounded-lg px-3 py-2 min-w-0 flex-1 max-w-md">
          <option value="">Select a batch…</option>
          {allBatches.map((b) => <option key={b.id} value={b.batchNumber}>{b.batchNumber} — {b.productNameLabel}</option>)}
        </select>
        <button className="bg-chili text-white px-5 py-2 rounded-full">Look Up</button>
      </form>

      {batch && !detail && <p className="text-sm text-chili">No batch found with number {batch}.</p>}
      {detail && (
        <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl space-y-2 text-sm">
          <p><b>Batch:</b> {detail.fg.batchNumber} — {detail.fg.productNameLabel}</p>
          <p><b>Raw material:</b> {detail.material?.name ?? "—"} · <b>Supplier:</b> {detail.supplier?.name ?? "—"}</p>
          <p><b>Qty sent for processing:</b> {detail.proc?.qtySent} kg on {detail.proc?.processingDate}</p>
          <p><b>Wastage:</b> {detail.proc?.wastageQty} kg ({detail.proc?.wastagePercent.toFixed(1)}%)</p>
          <p><b>Final powder produced:</b> {detail.fg.finalPowderQty} kg · <b>Remaining:</b> {detail.fg.remainingQty.toFixed(2)} kg</p>
          <p><b>Packaging runs:</b> {detail.packaging.length} ({detail.packaging.reduce((s: number, p: any) => s + p.packetsProduced, 0)} packets total)</p>
          <p><b>Packets sold:</b> {detail.totalPacketsSold}</p>
          <p><b>Sold in orders:</b> {detail.soldIn.length ? detail.soldIn.join(", ") : "none yet"}</p>
        </div>
      )}
    </div>
  );
}
