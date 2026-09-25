import Link from "next/link";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { createProduct } from "@/lib/admin-actions";
import { listSelectableImages } from "@/lib/uploads";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);
  const images = await listSelectableImages();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-sm underline">← Back to products</Link>
      <h1 className="font-heritage text-2xl mt-2 mb-4">Add product</h1>
      {allCategories.length === 0 && <p className="mb-4 text-sm text-chili">Create a category first on the <Link href="/admin/categories" className="underline">Categories</Link> page.</p>}
      <ProductForm action={createProduct} categories={allCategories} images={images} submitLabel="Create product" />
    </div>
  );
}
