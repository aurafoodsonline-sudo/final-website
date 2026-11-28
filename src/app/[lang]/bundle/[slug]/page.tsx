import { breadcrumbs, pageMetadata, pageUrl, structuredData, webUrl } from "@/lib/seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Lang, SITE_NAME } from "@/lib/constants";
import { getBundleBySlug, getBundleItems } from "@/lib/data";
import AddToCartButton from "@/components/AddToCartButton";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const bundle = await getBundleBySlug(slug);
  if (!bundle || bundle.isHidden) return {};
  const isUr = lang === "ur";
  const title = isUr ? bundle.nameUr : bundle.nameEn;
  const description = (isUr ? bundle.descriptionUr : bundle.descriptionEn) || title;
  return pageMetadata(isUr ? "ur" : "en", "/bundle/" + encodeURIComponent(slug), { title, description, image: bundle.image });
}

export default async function BundlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const bundle = await getBundleBySlug(slug);
  if (!bundle || bundle.isHidden) return notFound();
  const items = await getBundleItems(bundle.id);
  const name = lang === "ur" ? bundle.nameUr : bundle.nameEn;
  const path = "/bundle/" + encodeURIComponent(slug);
  const url = pageUrl(lang, path);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name, url,
    description: (lang === "ur" ? bundle.descriptionUr : bundle.descriptionEn) || undefined,
    brand: { "@type": "Brand", name: SITE_NAME }, image: webUrl(bundle.image || "/images/logo.jpg"),
    offers: { "@type": "Offer", url, price: bundle.price, priceCurrency: "PKR",
      availability: bundle.websiteStockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
  };
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(breadcrumbs(lang, { name: lang === "ur" ? "خریداری" : "Shop", path: "/shop" }, {name, path})) }} />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white"><Image src={bundle.image || "/images/logo.jpg"} alt={name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
        <div>
          <p className="text-cardamom font-medium mb-2">{lang === "ur" ? "خصوصی بنڈل" : "Special bundle"}</p>
          <h1 className="font-heritage text-3xl mb-3">{name}</h1>
          <p className="leading-relaxed mb-5">{lang === "ur" ? bundle.descriptionUr : bundle.descriptionEn}</p>
          <div className="flex items-center gap-3 mb-5"><span className="text-2xl font-semibold text-chili">Rs. {bundle.price}</span>{bundle.oldPrice ? <span className="line-through opacity-50">Rs. {bundle.oldPrice}</span> : null}</div>
          {bundle.websiteStockStatus === "out_of_stock" ? <p className="text-cinnamon font-medium">{lang === "ur" ? "اس وقت دستیاب نہیں" : "Currently out of stock"}</p> : <AddToCartButton product={{ id: bundle.id, slug: bundle.slug, name, price: bundle.price, image: bundle.image || "/images/logo.jpg", type: "bundle" }} label={lang === "ur" ? "کارٹ میں شامل کریں" : "Add bundle to cart"} addedLabel={lang === "ur" ? "شامل ہو گیا ✓" : "Added to cart ✓"} />}
          <h2 className="font-semibold mt-8 mb-3">{lang === "ur" ? "اس بنڈل میں شامل ہے" : "Included in this bundle"}</h2>
          <ul className="space-y-2 text-sm">{items.map(({ item, product }) => <li key={item.id} className="flex justify-between border-b border-cinnamon/10 pb-2"><span>{lang === "ur" ? product.nameUr : product.nameEn}</span><span>× {item.quantity}</span></li>)}</ul>
        </div>
      </div>
    </main>
  );
}