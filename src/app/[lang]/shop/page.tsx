import { getT } from "@/lib/site";
import { Lang, t } from "@/lib/constants";
import { getAllProducts, getAllBundles, getCategories } from "@/lib/data";
import ShopCatalog from "@/components/ShopCatalog";
import AnimatedTitle from "@/components/motion/AnimatedTitle";

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  const products = await getAllProducts();
  const bundles = await getAllBundles();
  const categories = await getCategories();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <AnimatedTitle tag="h1" text={d.nav_shop} lang={lang} align="start" className="font-heritage text-4xl md:text-5xl mb-8" />
      <ShopCatalog products={products} bundles={bundles} categories={categories} lang={lang} />
    </main>
  );
}
