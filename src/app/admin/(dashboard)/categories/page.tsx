import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { createCategory, updateCategory, deleteCategory } from "@/lib/admin-actions";

const field = "border rounded-lg px-2 py-1.5 w-full mt-1";

export default async function AdminCategoriesPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);
  const allProducts = await db.select({ categoryId: products.categoryId }).from(products);

  return (
    <div className="max-w-5xl">
      <h1 className="font-heritage text-2xl mb-1">Categories</h1>
      <p className="text-sm opacity-70 mb-4">Categories are the filters on the left of the Shop page. Lower “order” numbers appear first.</p>

      <div className="space-y-3 mb-8">
        {allCategories.map((category) => {
          const count = allProducts.filter((p) => p.categoryId === category.id).length;
          return (
            <div key={category.id} className="bg-white rounded-xl p-4 shadow-sm">
              <form action={updateCategory} className="grid md:grid-cols-[1fr_1fr_6rem_auto] gap-3 items-end">
                <input type="hidden" name="id" value={category.id} />
                <input type="hidden" name="slug" value={category.slug} />
                <input type="hidden" name="image" value={category.image ?? ""} />
                <label className="text-xs">English name<input name="nameEn" required defaultValue={category.nameEn} className={field} /></label>
                <label className="text-xs" dir="rtl">اردو نام<input name="nameUr" required defaultValue={category.nameUr} className={field} /></label>
                <label className="text-xs">Order<input name="sortOrder" type="number" defaultValue={category.sortOrder ?? 0} className={field} /></label>
                <button className="border border-cinnamon text-cinnamon px-4 py-2 rounded-full">Save</button>
              </form>
              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                <span>{count} product{count === 1 ? "" : "s"}</span>
                {count === 0 && (
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <button className="text-chili underline">Delete</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form action={createCategory} className="bg-white rounded-xl p-5 shadow-sm grid md:grid-cols-[1fr_1fr_6rem_auto] gap-3 items-end">
        <h2 className="font-semibold md:col-span-4">Add a category</h2>
        <label className="text-xs">English name *<input name="nameEn" required className={field} /></label>
        <label className="text-xs" dir="rtl">اردو نام<input name="nameUr" className={field} /></label>
        <label className="text-xs">Order<input name="sortOrder" type="number" defaultValue={allCategories.length} className={field} /></label>
        <button className="bg-chili text-white px-4 py-2 rounded-full">Add</button>
      </form>
    </div>
  );
}
