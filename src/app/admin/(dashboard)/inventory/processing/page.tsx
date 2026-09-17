import { db } from "@/db";
import { rawMaterials, suppliers, processingRecords } from "@/db/schema";
import { desc } from "drizzle-orm";
import { createProcessingRecord } from "@/lib/admin-actions";

export default async function ProcessingPage() {
  const materials = await db.select().from(rawMaterials);
  const allSuppliers = await db.select().from(suppliers);
  const records = await db.select().from(processingRecords).orderBy(desc(processingRecords.id));

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Raw Material → Grinding / Processing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3">New Processing Record</h2>
          <form action={createProcessingRecord} className="grid gap-2">
            <select name="rawMaterialId" required className="border rounded-lg px-3 py-2">
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.stockQty} {m.unit} available)</option>)}
            </select>
            <select name="supplierId" className="border rounded-lg px-3 py-2">
              <option value="">Supplier (optional)</option>
              {allSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" name="processingDate" required className="border rounded-lg px-3 py-2" />
            <input name="productNameLabel" placeholder="Output product label (e.g. Red Chilli Powder)" required className="border rounded-lg px-3 py-2" />
            <input type="number" step="0.01" name="qtySent" placeholder="Quantity Sent for Grinding (kg)" required className="border rounded-lg px-3 py-2" />
            <input type="number" step="0.01" name="expectedOutput" placeholder="Expected Output (kg)" className="border rounded-lg px-3 py-2" />
            <input type="number" step="0.01" name="actualOutput" placeholder="Actual Output (kg)" required className="border rounded-lg px-3 py-2" />
            <input name="processor" placeholder="Processor / Mill" className="border rounded-lg px-3 py-2" />
            <input type="number" step="0.01" name="processingCost" placeholder="Processing Cost" className="border rounded-lg px-3 py-2" />
            <textarea name="notes" placeholder="Notes" className="border rounded-lg px-3 py-2" />
            <p className="text-xs opacity-60">Wastage qty & % are calculated automatically (Sent − Actual Output). A batch number is minted automatically and carried through to Finished Goods.</p>
            <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save Processing Record</button>
          </form>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
          <h2 className="font-semibold mb-3 px-2">Processing Records</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Batch</th><th className="p-2">Material</th><th className="p-2">Sent</th><th className="p-2">Output</th><th className="p-2">Wastage%</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.batchNumber}</td>
                  <td className="p-2">{materials.find((m) => m.id === r.rawMaterialId)?.name}</td>
                  <td className="p-2">{r.qtySent} kg</td>
                  <td className="p-2">{r.actualOutput} kg</td>
                  <td className="p-2 text-chili">{r.wastagePercent.toFixed(1)}%</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td className="p-2 opacity-60" colSpan={5}>No processing records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
