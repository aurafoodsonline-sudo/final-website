import { db } from "@/db";
import { bundleItems, bundles, products } from "@/db/schema";
import { createBundle, updateBundle, deleteBundle } from "@/lib/admin-actions";
import { listSelectableImages } from "@/lib/uploads";
import AdminImagePicker from "@/components/AdminImagePicker";
import BundleProductFields from "./BundleProductFields";
import type { bundles as bundlesTable } from "@/db/schema";

type Bundle = typeof bundlesTable.$inferSelect;
const field = "border rounded-lg px-3 py-2 w-full mt-1";

function BundleFields({ bundle, productOptions, images, initialItems }: {
  bundle?: Bundle; productOptions: { id: number; nameEn: string }[]; images: string[]; initialItems?: { productId: number; quantity: number }[];
}) {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">Name (English) *<input name="nameEn" required defaultValue={bundle?.nameEn ?? ""} className={field} /></label>
        <label className="text-sm" dir="rtl">نام (اردو)<input name="nameUr" defaultValue={bundle?.nameUr ?? ""} className={field} /></label>
        <label className="text-sm">Bundle price (Rs.) *<input name="price" required type="number" min="1" step="1" defaultValue={bundle?.price ?? ""} className={field} /></label>
        <label className="text-sm">Original price (Rs.) <span className="opacity-60">— optional, shown crossed out</span><input name="oldPrice" type="number" min="0" step="1" defaultValue={bundle?.oldPrice ?? ""} className={field} /></label>
        <label className="text-sm">Description (English)<textarea name="descriptionEn" defaultValue={bundle?.descriptionEn ?? ""} className={field} /></label>
        <label className="text-sm" dir="rtl">تفصیل (اردو)<textarea name="descriptionUr" defaultValue={bundle?.descriptionUr ?? ""} className={field} /></label>
        <AdminImagePicker images={images} defaultValue={bundle?.image} label="Bundle photo" />
      </div>
      <BundleProductFields products={productOptions} initial={initialItems} />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">Stock
          <select name="websiteStockStatus" defaultValue={bundle?.websiteStockStatus ?? "available"} className="border rounded-lg px-2 py-2">
            <option value="available">Available</option><option value="limited">Limited stock</option><option value="out_of_stock">Out of stock</option>
          </select>
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isHidden" defaultChecked={!!bundle?.isHidden} /> Hide from website</label>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer opacity-70">Advanced: web address</summary>
        <input name="slug" defaultValue={bundle?.slug ?? ""} placeholder="made from the English name" className={field} />
      </details>
    </>
  );
}

export default async function AdminBundlesPage() {
  const allBundles = await db.select().from(bundles);
  const allProducts = await db.select().from(products);
  const items = await db.select().from(bundleItems);
  const images = await listSelectableImages();
  const productOptions = allProducts.map((product) => ({ id: product.id, nameEn: product.nameEn }));

  return (
    <div className="max-w-5xl">
      <h1 className="font-heritage text-2xl mb-1">Bundles</h1>
      <p className="text-sm opacity-70 mb-4">Bundles are sold as one item with one price (e.g. “BBQ Pack”). They appear at the top of the Shop page.</p>

      <div className="space-y-3 mb-8">
        {allBundles.map((bundle) => {
          const bundleRows = items.filter((item) => item.bundleId === bundle.id);
          return (
            <div key={bundle.id} className={`bg-white rounded-xl p-4 shadow-sm ${bundle.isHidden ? "opacity-75" : ""}`}>
              <div className="flex flex-wrap items-center gap-3">
                <img src={bundle.image || "/images/logo.jpg"} alt="" className="h-14 w-14 rounded-lg object-cover border bg-cream" />
                <div className="flex-1 min-w-48">
                  <h2 className="font-semibold">{bundle.nameEn} {bundle.isHidden ? <span className="text-xs bg-chili/10 text-chili px-2 py-0.5 rounded-full ml-1">Hidden</span> : null}</h2>
                  <p className="text-sm opacity-70">Rs. {bundle.price} · {bundle.websiteStockStatus.replace(/_/g, " ")}</p>
                  <p className="text-sm">{bundleRows.map((item) => `${allProducts.find((product) => product.id === item.productId)?.nameEn ?? "Deleted product"} ×${item.quantity}`).join(", ") || "No products added"}</p>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-chili underline text-sm w-fit">Edit bundle</summary>
                <form action={updateBundle} className="grid gap-4 mt-3">
                  <input type="hidden" name="id" value={bundle.id} />
                  <BundleFields bundle={bundle} productOptions={productOptions} images={images} initialItems={bundleRows.map((r) => ({ productId: r.productId, quantity: r.quantity }))} />
                  <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save bundle</button>
                </form>
                <form action={deleteBundle} className="mt-3 border-t pt-3">
                  <input type="hidden" name="id" value={bundle.id} />
                  <button className="text-sm text-chili underline">Delete this bundle permanently</button>
                  <span className="text-xs opacity-60 ml-2">(tip: tick “Hide from website” instead if you may sell it again)</span>
                </form>
              </details>
            </div>
          );
        })}
        {allBundles.length === 0 && <p className="opacity-60">No bundles yet — create one below.</p>}
      </div>

      <form action={createBundle} className="bg-white rounded-xl p-6 shadow-sm grid gap-4">
        <h2 className="font-semibold">Create a new bundle</h2>
        <BundleFields productOptions={productOptions} images={images} />
        <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Create bundle</button>
      </form>
    </div>
  );
}
