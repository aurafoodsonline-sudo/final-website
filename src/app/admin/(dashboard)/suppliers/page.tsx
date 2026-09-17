import { db } from "@/db";
import { suppliers, rawMaterialPurchases } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createSupplier } from "@/lib/admin-actions";

export default async function SuppliersPage() {
  const all = await db.select().from(suppliers);
  const financials = await Promise.all(all.map(async (s) => {
    const purchases = await db.select().from(rawMaterialPurchases).where(eq(rawMaterialPurchases.supplierId, s.id));
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
    const outstanding = purchases.reduce((sum, p) => sum + p.remainingAmount, 0);
    return { ...s, totalPurchases, totalPaid, outstanding, purchaseCount: purchases.length };
  }));

  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Supplier Management</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold mb-3">Add Supplier</h2>
          <form action={createSupplier} className="grid gap-2">
            <input name="name" placeholder="Supplier Name" required className="border rounded-lg px-3 py-2" />
            <input name="contact" placeholder="Contact Number" className="border rounded-lg px-3 py-2" />
            <input name="address" placeholder="Address" className="border rounded-lg px-3 py-2" />
            <input name="suppliedMaterials" placeholder="Supplied Raw Materials (comma separated)" className="border rounded-lg px-3 py-2" />
            <select name="paymentType" className="border rounded-lg px-3 py-2">
              <option value="cash">Cash</option><option value="credit">Credit</option>
            </select>
            <textarea name="notes" placeholder="Notes" className="border rounded-lg px-3 py-2" />
            <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save Supplier</button>
          </form>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
          <h2 className="font-semibold mb-3 px-2">Suppliers</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-2">Name</th><th className="p-2">Materials</th><th className="p-2">Purchases</th><th className="p-2">Paid</th><th className="p-2">Outstanding</th></tr></thead>
            <tbody>
              {financials.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.name}<br /><span className="text-xs opacity-60">{s.contact}</span></td>
                  <td className="p-2 text-xs">{s.suppliedMaterials}</td>
                  <td className="p-2">Rs. {s.totalPurchases}</td>
                  <td className="p-2">Rs. {s.totalPaid}</td>
                  <td className="p-2 text-chili">Rs. {s.outstanding}</td>
                </tr>
              ))}
              {financials.length === 0 && <tr><td className="p-2 opacity-60" colSpan={5}>No suppliers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
