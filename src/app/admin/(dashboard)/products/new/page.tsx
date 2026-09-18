import { db } from "@/db";
import { categories } from "@/db/schema";
import { createProduct } from "@/lib/admin-actions";
import { readdir } from "node:fs/promises";
import path from "node:path";

export default async function NewProductPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);
  const imageNames = (await readdir(path.join(process.cwd(), "public", "images", "products")))
    .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name));

  return (
    <div className="max-w-4xl">
      <h1 className="font-heritage text-2xl mb-4">Add product</h1>
      <form action={createProduct} className="bg-white rounded-xl p-6 shadow-sm grid gap-5">
        <section className="grid gap-3">
          <h2 className="font-semibold text-sm">Catalog details</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input name="slug" required placeholder="Slug" className="border rounded-lg px-2 py-1.5" />
            <input name="sku" required placeholder="SKU" className="border rounded-lg px-2 py-1.5" />
            <select name="categoryId" required className="border rounded-lg px-2 py-1.5">
              <option value="">Select category</option>
              {allCategories.map((category) => <option key={category.id} value={category.id}>{category.nameEn}</option>)}
            </select>
            <select name="image" defaultValue="" className="border rounded-lg px-2 py-1.5">
              <option value="">Use default logo</option>
              {imageNames.map((name) => <option key={name} value={`/images/products/${name}`}>{name}</option>)}
            </select>
            <input name="weightLabel" required placeholder="Weight label, e.g. 100g" className="border rounded-lg px-2 py-1.5" />
            <input name="price" required type="number" min="0" step="0.01" placeholder="Price" className="border rounded-lg px-2 py-1.5" />
            <input name="oldPrice" type="number" min="0" step="0.01" placeholder="Old price" className="border rounded-lg px-2 py-1.5" />
            <input name="wholesalePrice" type="number" min="0" step="0.01" placeholder="Wholesale price" className="border rounded-lg px-2 py-1.5" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label><input type="checkbox" name="bestSeller" /> Best seller</label>
            <label><input type="checkbox" name="newArrival" /> New arrival</label>
            <label><input type="checkbox" name="featured" /> Featured</label>
            <label><input type="checkbox" name="wholesaleEligible" defaultChecked /> Wholesale eligible</label>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4 border-t pt-4">
          <div className="grid gap-2">
            <h2 className="font-semibold text-sm">English</h2>
            <input name="nameEn" required placeholder="Name" className="border rounded-lg px-2 py-1.5" />
            <input name="taglineEn" placeholder="Tagline" className="border rounded-lg px-2 py-1.5" />
            <textarea name="descriptionEn" placeholder="Description" rows={4} className="border rounded-lg px-2 py-1.5" />
            <textarea name="ingredientsEn" placeholder="Ingredients" rows={3} className="border rounded-lg px-2 py-1.5" />
            <textarea name="usageEn" placeholder="Usage" rows={3} className="border rounded-lg px-2 py-1.5" />
            <input name="imageAltEn" placeholder="Image ALT" className="border rounded-lg px-2 py-1.5" />
          </div>
          <div className="grid gap-2" dir="rtl">
            <h2 className="font-semibold text-sm">اردو</h2>
            <input name="nameUr" required placeholder="نام" className="border rounded-lg px-2 py-1.5" />
            <input name="taglineUr" placeholder="ٹیگ لائن" className="border rounded-lg px-2 py-1.5" />
            <textarea name="descriptionUr" placeholder="تفصیل" rows={4} className="border rounded-lg px-2 py-1.5" />
            <textarea name="ingredientsUr" placeholder="اجزاء" rows={3} className="border rounded-lg px-2 py-1.5" />
            <textarea name="usageUr" placeholder="استعمال" rows={3} className="border rounded-lg px-2 py-1.5" />
            <input name="imageAltUr" placeholder="تصویر ALT" className="border rounded-lg px-2 py-1.5" />
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-3 border-t pt-4">
          <h2 className="font-semibold text-sm md:col-span-2">Website stock</h2>
          <select name="websiteStockStatus" defaultValue="available" className="border rounded-lg px-2 py-1.5">
            <option value="available">Available</option><option value="limited">Limited stock</option><option value="out_of_stock">Out of stock</option>
          </select>
          <input name="websiteStockQty" type="number" min="0" placeholder="Display quantity" className="border rounded-lg px-2 py-1.5" />
          <label className="text-sm"><input type="checkbox" name="isHidden" /> Hide from website</label>
        </section>

        <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Create product</button>
      </form>
    </div>
  );
}
