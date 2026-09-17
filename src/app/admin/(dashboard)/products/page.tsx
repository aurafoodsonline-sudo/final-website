import { db } from "@/db";
import { products } from "@/db/schema";
import { setWebsiteStock } from "@/lib/admin-actions";
import Link from "next/link";

export default async function AdminProductsPage() {
  const all = await db.select().from(products);
  return (
    <div>
      <h1 className="font-heritage text-2xl mb-2">Products / Website Stock</h1>
      <p className="text-sm opacity-70 mb-4 max-w-2xl">
        Website Stock Status is admin-controlled and completely independent from Internal Inventory Stock (auto-updated by Packaging). Changing internal stock never changes what customers see, and vice versa.
      </p>
      <div className="space-y-3">
        {all.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
            <div className="w-48">
              <p className="font-medium">{p.nameEn}</p>
              <p className="text-xs opacity-50">{p.sku} · Internal stock: {p.internalStockQty} packets</p>
            </div>
            <form action={setWebsiteStock} className="flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="productId" value={p.id} />
              <select name="websiteStockStatus" defaultValue={p.websiteStockStatus} className="border rounded-lg px-2 py-1.5">
                <option value="available">Available</option>
                <option value="limited">Limited Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <input type="number" name="websiteStockQty" defaultValue={p.websiteStockQty ?? ""} placeholder="Display qty" className="border rounded-lg px-2 py-1.5 w-28" />
              <label className="flex items-center gap-1"><input type="checkbox" name="isHidden" defaultChecked={!!p.isHidden} /> Hide</label>
              <button className="bg-chili text-white px-3 py-1.5 rounded-full">Save</button>
            </form>
            <Link href={`/admin/products/${p.id}`} className="text-sm underline ml-auto">SEO & EN/UR content →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
