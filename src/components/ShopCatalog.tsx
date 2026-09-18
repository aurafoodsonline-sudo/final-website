"use client";

import { useState } from "react";
import { Lang } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";

type ShopCatalogProps = {
  products: any[];
  categories: any[];
  lang: Lang;
};

export default function ShopCatalog({ products, categories, lang }: ShopCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const visibleProducts = selectedCategory === null
    ? products
    : products.filter((product) => product.categoryId === selectedCategory);

  return (
    <div className={`flex flex-col gap-8 md:flex-row ${lang === "ur" ? "md:flex-row-reverse" : ""}`}>
      <aside className="w-full shrink-0 md:w-56 md:sticky md:top-24 md:self-start">
        <h2 className="font-semibold mb-3">{lang === "ur" ? "زمرے" : "Categories"}</h2>
        <div className="flex gap-2 flex-wrap text-sm md:flex-col md:items-stretch">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`text-left border rounded-full px-3 py-2 md:rounded-lg ${selectedCategory === null ? "bg-cinnamon text-cream" : "border-cinnamon/20"}`}
          >
            {lang === "ur" ? "تمام مصنوعات" : "All products"}
          </button>
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`text-left border rounded-full px-3 py-2 md:rounded-lg ${isSelected ? "bg-cinnamon text-cream" : "border-cinnamon/20"}`}
              >
                {lang === "ur" ? category.nameUr : category.nameEn}
              </button>
            );
          })}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {visibleProducts.map((product) => <ProductCard key={product.id} p={product} lang={lang} />)}
          </div>
        ) : (
          <p className="rounded-xl bg-white/70 p-6 text-center opacity-70">
            {lang === "ur" ? "اس زمرے میں کوئی مصنوعات نہیں ہیں۔" : "No products in this category yet."}
          </p>
        )}
      </div>
    </div>
  );
}
