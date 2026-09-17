import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProductContent } from "@/lib/admin-actions";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(products).where(eq(products.id, Number(id)));
  if (!p) return notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="font-heritage text-2xl mb-4">{p.nameEn} — Bilingual Content & SEO</h1>
      <form action={updateProductContent} className="bg-white rounded-xl p-6 shadow-sm grid gap-4">
        <input type="hidden" name="id" value={p.id} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold mb-2 text-sm">English</h2>
            <label className="text-xs block mb-1">Name<input name="nameEn" defaultValue={p.nameEn} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">Tagline<input name="taglineEn" defaultValue={p.taglineEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">Description<textarea name="descriptionEn" defaultValue={p.descriptionEn ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={4} /></label>
          </div>
          <div dir="rtl">
            <h2 className="font-semibold mb-2 text-sm">اردو</h2>
            <label className="text-xs block mb-1">نام<input name="nameUr" defaultValue={p.nameUr} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">ٹیگ لائن<input name="taglineUr" defaultValue={p.taglineUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" /></label>
            <label className="text-xs block mb-1 mt-2">تفصیل<textarea name="descriptionUr" defaultValue={p.descriptionUr ?? ""} className="border rounded-lg px-2 py-1.5 w-full" rows={4} /></label>
          </div>
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
