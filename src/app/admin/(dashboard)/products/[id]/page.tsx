import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProductContent } from "@/lib/admin-actions";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(products).where(eq(products.id, Number(id)));
  const allCategories = await db.select().from(categories);
  if (!p) return notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="font-heritage text-2xl mb-4">{p.nameEn} — Bilingual Content & SEO</h1>
      <form action={updateProductContent} className="bg-white rounded-xl p-6 shadow-sm grid gap-4">
        <input type="hidden" name="id" value={p.id} />
        <h2 className="font-semibold text-sm">Catalog Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs">Slug<input name="slug" defaultValue={p.slug} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">SKU<input name="sku" defaultValue={p.sku} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Category<select name="categoryId" defaultValue={p.categoryId} className="border rounded-lg px-2 py-1.5 w-full">
            {allCategories.map((category) => <option key={category.id} value={category.id}>{category.nameEn}</option>)}
          </select></label>
          <label className="text-xs">Image path<input name="image" defaultValue={p.image ?? ""} className="border rounded-lg px-2 py-1.5 w-full" placeholder="/images/products/product01.jpeg" /></label>
          <label className="text-xs">Weight label<input name="weightLabel" defaultValue={p.weightLabel} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Price<input type="number" name="price" defaultValue={p.price} step="0.01" min="0" className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Old price<input type="number" name="oldPrice" defaultValue={p.oldPrice ?? ""} step="0.01" min="0" className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Wholesale price<input type="number" name="wholesalePrice" defaultValue={p.wholesalePrice ?? ""} step="0.01" min="0" className="border rounded-lg px-2 py-1.5 w-full" /></label>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="bestSeller" defaultChecked={!!p.bestSeller} /> Best seller</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="newArrival" defaultChecked={!!p.newArrival} /> New arrival</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={!!p.featured} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="wholesaleEligible" defaultChecked={!!p.wholesaleEligible} /> Wholesale eligible</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2 text-sm">English</h2>
            <label className="text-xs block mb-1">Name<input name="nameEn" defaultValue={p.nameEn} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">Tagline<input name="taglineEn" defaultValue={p.taglineEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">Description<textarea name="descriptionEn" defaultValue={p.descriptionEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={4} /></label>
            <label className="text-xs block mb-1 mt-2">Ingredients<textarea name="ingredientsEn" defaultValue={p.ingredientsEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={3} /></label>
            <label className="text-xs block mb-1 mt-2">Usage<textarea name="usageEn" defaultValue={p.usageEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={3} /></label>
          </div>
          <div dir="rtl">
            <h2 className="font-semibold mb-2 text-sm">اردو</h2>
            <label className="text-xs block mb-1">نام<input name="nameUr" defaultValue={p.nameUr} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">ٹیگ لائن<input name="taglineUr" defaultValue={p.taglineUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">تفصیل<textarea name="descriptionUr" defaultValue={p.descriptionUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={4} /></label>
            <label className="text-xs block mb-1 mt-2">اجزاء<textarea name="ingredientsUr" defaultValue={p.ingredientsUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={3} /></label>
            <label className="text-xs block mb-1 mt-2">استعمال<textarea name="usageUr" defaultValue={p.usageUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={3} /></label>
          </div>
        </div>

        <h2 className="font-semibold text-sm border-t pt-4">Website Stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs">Stock status<select name="websiteStockStatus" defaultValue={p.websiteStockStatus} className="border rounded-lg px-2 py-1.5 w-full">
            <option value="available">Available</option><option value="limited">Limited Stock</option><option value="out_of_stock">Out of Stock</option>
          </select></label>
          <label className="text-xs">Display quantity<input type="number" name="websiteStockQty" defaultValue={p.websiteStockQty ?? ""} min="0" className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isHidden" defaultChecked={!!p.isHidden} /> Hide from website</label>
        </div>

        <h2 className="font-semibold text-sm border-t pt-4">SEO Control Panel</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs">Meta Title (EN)<input name="metaTitleEn" defaultValue={p.metaTitleEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Meta Title (UR)<input name="metaTitleUr" defaultValue={p.metaTitleUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" dir="rtl" /></label>
          <label className="text-xs">Meta Description (EN)<input name="metaDescriptionEn" defaultValue={p.metaDescriptionEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Meta Description (UR)<input name="metaDescriptionUr" defaultValue={p.metaDescriptionUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" dir="rtl" /></label>
          <label className="text-xs">Image ALT (EN)<input name="imageAltEn" defaultValue={p.imageAltEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs">Image ALT (UR)<input name="imageAltUr" defaultValue={p.imageAltUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" dir="rtl" /></label>
          <label className="text-xs col-span-2">Canonical URL<input name="canonicalUrl" defaultValue={p.canonicalUrl ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
          <label className="text-xs flex items-center gap-2"><input type="checkbox" name="noIndex" defaultChecked={!!p.noIndex} /> No-index this product page</label>
        </div>
        <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save</button>
      </form>
    </div>
  );
}
