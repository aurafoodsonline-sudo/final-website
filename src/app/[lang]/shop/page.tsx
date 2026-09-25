import { Lang, t } from "@/lib/constants";
import { getAllProducts, getAllBundles, getCategories } from "@/lib/data";
import ShopCatalog from "@/components/ShopCatalog";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  const products = await getAllProducts();
  const bundles = await getAllBundles();
  const categories = await getCategories();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="font-heritage text-3xl mb-2">{d.nav_shop}</h1>
      <ShopCatalog products={products} bundles={bundles} categories={categories} lang={lang} />
    </main>
  );
}
