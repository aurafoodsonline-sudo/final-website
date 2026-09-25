import GrammagePriceEditor from "@/components/GrammagePriceEditor";
import AdminImagePicker from "@/components/AdminImagePicker";
import type { products } from "@/db/schema";

type Product = typeof products.$inferSelect;
type Category = { id: number; nameEn: string };

const field = "border rounded-lg px-2 py-1.5 w-full mt-1";

// One form for both "Add product" and "Edit product", laid out from most to least used.
export default function ProductForm({ action, product, categories, images, submitLabel }: {
  action: (formData: FormData) => Promise<void>;
  product?: Product;
  categories: Category[];
  images: string[];
  submitLabel: string;
}) {
  const p = product;
  return (
    <form action={action} className="bg-white rounded-xl p-4 md:p-6 shadow-sm grid gap-6">
      {p && <input type="hidden" name="id" value={p.id} />}

      <section className="grid md:grid-cols-2 gap-4">
        <h2 className="font-semibold md:col-span-2">1. Basic details</h2>
        <label className="text-sm">Name (English) *<input name="nameEn" required defaultValue={p?.nameEn ?? ""} className={field} /></label>
        <label className="text-sm" dir="rtl">نام (اردو)<input name="nameUr" defaultValue={p?.nameUr ?? ""} placeholder="خالی چھوڑیں تو انگریزی نام استعمال ہو گا" className={field} /></label>
        <label className="text-sm">Category *
          <select name="categoryId" required defaultValue={p?.categoryId ?? ""} className={field}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </select>
        </label>
        <label className="text-sm">Old price (Rs.) <span className="opacity-60">— optional, shown crossed out</span>
          <input type="number" name="oldPrice" min="0" step="1" defaultValue={p?.oldPrice ?? ""} className={field} />
        </label>
        <GrammagePriceEditor initialValue={p?.grammageOptions} fallbackLabel={p?.weightLabel ?? ""} fallbackPrice={p?.price ?? 0} />
        <AdminImagePicker images={images} defaultValue={p?.image} label="Product photo" />
      </section>

      <section className="grid md:grid-cols-2 gap-4 border-t pt-5">
        <h2 className="font-semibold md:col-span-2">2. Website visibility & labels</h2>
        <label className="text-sm">Stock status shown to customers
          <select name="websiteStockStatus" defaultValue={p?.websiteStockStatus ?? "available"} className={field}>
            <option value="available">Available</option>
            <option value="limited">Limited stock</option>
            <option value="out_of_stock">Out of stock (cannot be ordered)</option>
          </select>
        </label>
        <label className="text-sm">Display quantity <span className="opacity-60">— optional</span>
          <input type="number" name="websiteStockQty" min="0" defaultValue={p?.websiteStockQty ?? ""} className={field} />
        </label>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm md:col-span-2">
          <label className="flex items-center gap-2"><input type="checkbox" name="isHidden" defaultChecked={!!p?.isHidden} /> Hide from website</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="bestSeller" defaultChecked={!!p?.bestSeller} /> Show in “Best Sellers”</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="newArrival" defaultChecked={!!p?.newArrival} /> Show in “New Arrivals”</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={!!p?.featured} /> Featured</label>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 border-t pt-5">
        <h2 className="font-semibold md:col-span-2">3. Wholesale (1 kg packs)</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="wholesaleEligible" defaultChecked={p ? !!p.wholesaleEligible : true} /> Show on the Wholesale page</label>
        <label className="text-sm">Wholesale price per 1 kg (Rs.)
          <input type="number" name="wholesalePrice" min="0" step="1" defaultValue={p?.wholesalePrice ?? ""} className={field} />
        </label>
      </section>

      <section className="grid md:grid-cols-2 gap-4 border-t pt-5">
        <h2 className="font-semibold md:col-span-2">4. Description</h2>
        <div className="grid gap-2">
          <p className="text-sm font-medium">English</p>
          <label className="text-xs">Short tagline<input name="taglineEn" defaultValue={p?.taglineEn ?? ""} className={field} /></label>
          <label className="text-xs">Description<textarea name="descriptionEn" defaultValue={p?.descriptionEn ?? ""} rows={4} className={field} /></label>
          <label className="text-xs">Ingredients<textarea name="ingredientsEn" defaultValue={p?.ingredientsEn ?? ""} rows={2} className={field} /></label>
          <label className="text-xs">How to use<textarea name="usageEn" defaultValue={p?.usageEn ?? ""} rows={2} className={field} /></label>
        </div>
        <div className="grid gap-2" dir="rtl">
          <p className="text-sm font-medium">اردو</p>
          <label className="text-xs">ٹیگ لائن<input name="taglineUr" defaultValue={p?.taglineUr ?? ""} className={field} /></label>
          <label className="text-xs">تفصیل<textarea name="descriptionUr" defaultValue={p?.descriptionUr ?? ""} rows={4} className={field} /></label>
          <label className="text-xs">اجزاء<textarea name="ingredientsUr" defaultValue={p?.ingredientsUr ?? ""} rows={2} className={field} /></label>
          <label className="text-xs">استعمال<textarea name="usageUr" defaultValue={p?.usageUr ?? ""} rows={2} className={field} /></label>
        </div>
      </section>

      <details className="border-t pt-5">
        <summary className="font-semibold cursor-pointer">5. Advanced: web address, SKU & SEO <span className="font-normal text-xs opacity-60">(optional — filled in automatically if left blank)</span></summary>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <label className="text-xs">Web address (slug)<input name="slug" defaultValue={p?.slug ?? ""} placeholder="made from the English name" className={field} /></label>
          <label className="text-xs">SKU<input name="sku" defaultValue={p?.sku ?? ""} placeholder="generated automatically" className={field} /></label>
          <label className="text-xs">Image description (EN)<input name="imageAltEn" defaultValue={p?.imageAltEn ?? ""} className={field} /></label>
          <label className="text-xs">Image description (UR)<input name="imageAltUr" defaultValue={p?.imageAltUr ?? ""} dir="rtl" className={field} /></label>
          {p && (
            <>
              <label className="text-xs">Meta title (EN)<input name="metaTitleEn" defaultValue={p.metaTitleEn ?? ""} className={field} /></label>
              <label className="text-xs">Meta title (UR)<input name="metaTitleUr" defaultValue={p.metaTitleUr ?? ""} dir="rtl" className={field} /></label>
              <label className="text-xs">Meta description (EN)<input name="metaDescriptionEn" defaultValue={p.metaDescriptionEn ?? ""} className={field} /></label>
              <label className="text-xs">Meta description (UR)<input name="metaDescriptionUr" defaultValue={p.metaDescriptionUr ?? ""} dir="rtl" className={field} /></label>
              <label className="text-xs md:col-span-2">Canonical URL<input name="canonicalUrl" defaultValue={p.canonicalUrl ?? ""} placeholder="leave blank to use the normal product address" className={field} /></label>
              <label className="text-xs flex items-center gap-2"><input type="checkbox" name="noIndex" defaultChecked={!!p.noIndex} /> Hide this page from Google (no-index)</label>
            </>
          )}
        </div>
      </details>

      <div className="sticky bottom-0 -mx-4 md:-mx-6 -mb-4 md:-mb-6 px-4 md:px-6 py-3 bg-white/95 border-t rounded-b-xl">
        <button className="bg-chili text-white px-6 py-2.5 rounded-full font-medium">{submitLabel}</button>
      </div>
    </form>
  );
}
