import { Lang, t } from "@/lib/constants";
import { getAllProducts, getCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  const products = await getAllProducts();
  const categories = await getCategories();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-heritage text-3xl mb-2">{d.nav_shop}</h1>
      <div className="flex gap-2 flex-wrap mb-8 text-sm">
        {categories.map((c) => (
          <span key={c.id} className="border border-cinnamon/20 rounded-full px-3 py-1">
            {lang === "ur" ? c.nameUr : c.nameEn}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}
      </div>
    </main>
  );
}
