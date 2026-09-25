import Link from "next/link";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { setWebsiteStock } from "@/lib/admin-actions";
import { parseGrammageOptions } from "@/lib/grammage";

export default async function AdminProductsPage() {
  const all = await db.select().from(products);
  const cats = await db.select().from(categories);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="font-heritage text-2xl">Products & Stock</h1>
        <Link href="/admin/products/new" className="bg-chili text-white px-4 py-2 rounded-full text-sm">+ Add product</Link>
      </div>
      <p className="text-sm opacity-70 mb-4 max-w-2xl">
        Click <b>Edit</b> to change a product&apos;s name, photo, sizes, prices or description. Use the quick controls to change
        what customers see. <span className="opacity-80">“Internal stock” is counted from Packaging and never changes the website on its own.</span>
      </p>
      <div className="space-y-3">
        {all.map((p) => {
          const sizes = parseGrammageOptions(p.grammageOptions, p.weightLabel, p.price);
          return (
            <div key={p.id} className={`bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4 ${p.isHidden ? "opacity-70" : ""}`}>
              <img src={p.image || "/images/logo.jpg"} alt="" className="h-14 w-14 rounded-lg object-cover border bg-cream" />
              <div className="flex-1 min-w-48">
                <p className="font-medium">{p.nameEn} {p.isHidden ? <span className="text-xs bg-chili/10 text-chili px-2 py-0.5 rounded-full ml-1">Hidden</span> : null}</p>
                <p className="text-xs opacity-60">
                  {cats.find((c) => c.id === p.categoryId)?.nameEn ?? "No category"} · {sizes.map((s) => `${s.label} Rs. ${s.price}`).join(" · ")}
                </p>
                <p className="text-xs opacity-60">Internal stock: {p.internalStockQty ?? 0} packets</p>
              </div>
              <form action={setWebsiteStock} className="flex flex-wrap items-center gap-2 text-sm">
                <input type="hidden" name="productId" value={p.id} />
                <select name="websiteStockStatus" defaultValue={p.websiteStockStatus} className="border rounded-lg px-2 py-1.5" aria-label="Website stock status">
                  <option value="available">Available</option>
                  <option value="limited">Limited Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <input type="number" name="websiteStockQty" min="0" defaultValue={p.websiteStockQty ?? ""} placeholder="Display qty" className="border rounded-lg px-2 py-1.5 w-28" aria-label="Display quantity" />
                <label className="flex items-center gap-1"><input type="checkbox" name="isHidden" defaultChecked={!!p.isHidden} /> Hide</label>
                <button className="border border-chili text-chili px-3 py-1.5 rounded-full">Save</button>
              </form>
              <Link href={`/admin/products/${p.id}`} className="bg-chili text-white px-4 py-1.5 rounded-full text-sm">Edit</Link>
            </div>
          );
        })}
        {all.length === 0 && <p className="opacity-60">No products yet.</p>}
      </div>
    </div>
  );
}
