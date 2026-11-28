import { pageMetadata } from "@/lib/seo";
import { getT } from "@/lib/site";
import { Lang, t } from "@/lib/constants";
import { getAllProducts, getAllBundles, getCategories } from "@/lib/data";
import ShopCatalog from "@/components/ShopCatalog";
import AnimatedTitle from "@/components/motion/AnimatedTitle";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang === "ur" ? "ur" : "en";
  return pageMetadata(lang, "/shop", lang === "ur"
    ? { title: "مصالحے اور مسالہ جات خریدیں", description: "آورا فوڈز کے مصالحے اور بنڈلز زمرے، پیک سائز اور قیمت کے لحاظ سے دیکھیں۔" }
    : { title: "Shop Spices and Spice Blends", description: "Browse Aura Foods spices, seasonings and bundles by category, pack size and price." });
}

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const [d, products, bundles, categories] = await Promise.all([
    getT(lang), getAllProducts(), getAllBundles(), getCategories(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <AnimatedTitle tag="h1" text={d.nav_shop} lang={lang} align="start" className="font-heritage text-4xl md:text-5xl mb-8" />
      <ShopCatalog products={products} bundles={bundles} categories={categories} lang={lang} />
    </main>
  );
}
