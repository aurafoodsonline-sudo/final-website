import { db } from "@/db";
import { categories } from "@/db/schema";
import { createCategory, updateCategory } from "@/lib/admin-actions";

export default async function AdminCategoriesPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);

  return (
    <div className="max-w-5xl">
      <h1 className="font-heritage text-2xl mb-4">Categories</h1>
      <form action={createCategory} className="bg-white rounded-xl p-5 shadow-sm grid gap-3 mb-6">
        <h2 className="font-semibold">Add category</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input name="slug" required placeholder="Slug" className="border rounded-lg px-2 py-1.5" />
          <input name="nameEn" required placeholder="English name" className="border rounded-lg px-2 py-1.5" />
          <input name="nameUr" required placeholder="Urdu name" dir="rtl" className="border rounded-lg px-2 py-1.5" />
          <input name="sortOrder" type="number" defaultValue="0" placeholder="Sort order" className="border rounded-lg px-2 py-1.5" />
        </div>
        <input name="image" placeholder="Image path, e.g. /images/category_1.jpg" className="border rounded-lg px-2 py-1.5 w-full" />
        <button className="bg-chili text-white px-4 py-2 rounded-full w-fit">Add category</button>
      </form>

      <div className="space-y-4">
        {allCategories.map((category) => (
          <form key={category.id} action={updateCategory} className="bg-white rounded-xl p-5 shadow-sm grid gap-3">
            <input type="hidden" name="id" value={category.id} />
            <div className="grid md:grid-cols-4 gap-3">
              <input name="slug" required defaultValue={category.slug} className="border rounded-lg px-2 py-1.5" />
              <input name="nameEn" required defaultValue={category.nameEn} className="border rounded-lg px-2 py-1.5" />
              <input name="nameUr" required defaultValue={category.nameUr} dir="rtl" className="border rounded-lg px-2 py-1.5" />
              <input name="sortOrder" type="number" defaultValue={category.sortOrder ?? 0} className="border rounded-lg px-2 py-1.5" />
            </div>
            <input name="image" defaultValue={category.image ?? ""} placeholder="Image path" className="border rounded-lg px-2 py-1.5 w-full" />
            <button className="border border-cinnamon text-cinnamon px-4 py-2 rounded-full w-fit">Save category</button>
          </form>
        ))}
      </div>
    </div>
  );
}
