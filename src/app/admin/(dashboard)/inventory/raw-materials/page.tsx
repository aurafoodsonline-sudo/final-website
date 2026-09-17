import { db } from "@/db";
import { rawMaterials, rawMaterialPurchases, suppliers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { createRawMaterialPurchase, createRawMaterial } from "@/lib/admin-actions";

export default async function RawMaterialsPage() {
  const materials = await db.select().from(rawMaterials);
  const allSuppliers = await db.select().from(suppliers);
  const purchases = await db.select().from(rawMaterialPurchases).orderBy(desc(rawMaterialPurchases.id));

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Raw Material Purchasing & Stock</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs opacity-60">{m.name}</p>
            <p className="text-xl font-semibold">{m.stockQty} {m.unit} <span className="text-xs font-normal opacity-60">available</span></p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Log New Purchase</h2>
          <form action={createRawMaterialPurchase} className="grid gap-2">
            <select name="supplierId" required className="border rounded-lg px-3 py-2">
              {allSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select name="rawMaterialId" required className="border rounded-lg px-3 py-2">
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="date" name="purchaseDate" required className="border rounded-lg px-3 py-2" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" step="0.01" name="quantity" placeholder="Quantity" required className="border rounded-lg px-3 py-2" />
              <select name="unit" className="border rounded-lg px-3 py-2"><option value="kg">kg</option><option value="g">g</option></select>
            </div>
            <input type="number" step="0.01" name="purchaseRate" placeholder="Purchase Rate (per unit)" required className="border rounded-lg px-3 py-2" />
            <select name="paymentType" className="border rounded-lg px-3 py-2"><option value="cash">Cash</option><option value="credit">Credit</option></select>
            <input type="number" step="0.01" name="paidAmount" placeholder="Paid Amount" defaultValue={0} className="border rounded-lg px-3 py-2" />
            <textarea name="notes" placeholder="Notes" className="border rounded-lg px-3 py-2" />
            <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save Purchase</button>
          </form>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer underline">+ Add a new raw material type</summary>
            <form action={createRawMaterial} className="grid gap-2 mt-2">
              <input name="name" placeholder="Raw Material Name" required className="border rounded-lg px-3 py-2" />
              <select name="unit" className="border rounded-lg px-3 py-2"><option value="kg">kg</option><option value="g">g</option></select>
              <button className="bg-cinnamon text-white px-4 py-1.5 rounded-full w-fit text-sm">Add</button>
            </form>
          </details>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
          <h2 className="font-semibold mb-3 px-2">Purchase History</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Date</th><th className="p-2">Material</th><th className="p-2">Qty</th><th className="p-2">Cost</th><th className="p-2">Remaining</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.purchaseDate}</td>
                  <td className="p-2">{materials.find((m) => m.id === p.rawMaterialId)?.name}</td>
                  <td className="p-2">{p.quantity} {p.unit}</td>
                  <td className="p-2">Rs. {p.totalCost}</td>
                  <td className="p-2 text-chili">Rs. {p.remainingAmount}</td>
                </tr>
              ))}
              {purchases.length === 0 && <tr><td className="p-2 opacity-60" colSpan={5}>No purchases logged yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
