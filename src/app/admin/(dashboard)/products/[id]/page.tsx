import Link from "next/link";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProductContent } from "@/lib/admin-actions";
import { listSelectableImages } from "@/lib/uploads";
import ProductForm from "../ProductForm";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(products).where(eq(products.id, Number(id) || 0));
  if (!p) return notFound();
  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);
  const images = await listSelectableImages();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/products" className="text-sm underline">← Back to products</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-2 mb-4">
        <h1 className="font-heritage text-2xl">Edit: {p.nameEn}</h1>
        {!p.isHidden && <a href={`/en/product/${p.slug}`} target="_blank" rel="noreferrer" className="text-sm underline">View on website ↗</a>}
      </div>
      <p className="text-xs opacity-60 mb-4">Internal stock (from Packaging): {p.internalStockQty ?? 0} packets · SKU {p.sku}</p>
      <ProductForm action={updateProductContent} product={p} categories={allCategories} images={images} submitLabel="Save changes" />
    </div>
  );
}
