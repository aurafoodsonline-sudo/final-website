import Image from "next/image";
import type { Metadata } from "next";
import { Lang, t, SITE_URL } from "@/lib/constants";
import { getProductBySlug, getApprovedReviews } from "@/lib/data";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  const isUr = lang === "ur";
  return {
    title: isUr ? p.metaTitleUr ?? p.nameUr : p.metaTitleEn ?? p.nameEn,
    description: isUr ? p.metaDescriptionUr ?? p.taglineUr ?? "" : p.metaDescriptionEn ?? p.taglineEn ?? "",
    alternates: { canonical: p.canonicalUrl ?? `${SITE_URL}/${lang}/product/${slug}` },
    robots: p.noIndex ? { index: false } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  const p = await getProductBySlug(slug);
  if (!p) return notFound();
  const reviews = await getApprovedReviews(p.id);
  const name = lang === "ur" ? p.nameUr : p.nameEn;
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: `${SITE_URL}${p.image}`,
    description: lang === "ur" ? p.descriptionUr : p.descriptionEn,
    offers: { "@type": "Offer", price: p.price, priceCurrency: "PKR", availability: p.websiteStockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
    ...(avgRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: reviews.length } } : {}),
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
          <Image src={p.image ?? "/images/logo.jpg"} alt={lang === "ur" ? p.imageAltUr ?? name : p.imageAltEn ?? name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="font-heritage text-3xl mb-1">{name}</h1>
          <p className="opacity-70 mb-4">{lang === "ur" ? p.taglineUr : p.taglineEn}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-semibold text-chili">Rs. {p.price}</span>
            {p.oldPrice ? <span className="line-through opacity-50">Rs. {p.oldPrice}</span> : null}
            <span className="text-sm opacity-60">· {p.weightLabel}</span>
          </div>
          {p.websiteStockStatus === "out_of_stock" ? (
            <p className="text-cinnamon font-medium mb-4">{d.out_of_stock}</p>
          ) : (
            <div className="mb-6">
              <AddToCartButton
                product={{ id: p.id, slug: p.slug, name, price: p.price, image: p.image ?? "/images/logo.jpg" }}
                label={d.add_to_cart}
                addedLabel={lang === "ur" ? "کارٹ میں شامل ہو گیا ✓" : "Added to cart ✓"}
              />
            </div>
          )}
          <p className="leading-relaxed">{lang === "ur" ? p.descriptionUr : p.descriptionEn}</p>
          <h3 className="font-semibold mt-5 mb-1">{lang === "ur" ? "اجزاء" : "Ingredients"}</h3>
          <p className="text-sm opacity-80">{lang === "ur" ? p.ingredientsUr : p.ingredientsEn}</p>
          <h3 className="font-semibold mt-4 mb-1">{lang === "ur" ? "استعمال" : "Usage"}</h3>
          <p className="text-sm opacity-80">{lang === "ur" ? p.usageUr : p.usageEn}</p>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-heritage text-2xl mb-4">{d.reviews} {avgRating ? `(${avgRating} ★ · ${reviews.length})` : ""}</h2>
        <div className="space-y-4 mb-8">
          {reviews.length === 0 && <p className="opacity-60 text-sm">{lang === "ur" ? "ابھی کوئی تجربہ نہیں۔" : "No reviews yet."}</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border border-cinnamon/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{r.customerName}</span>
                <span className="text-turmeric">{"★".repeat(r.rating)}</span>
                <span className="text-xs bg-cardamom/20 text-cardamom px-2 py-0.5 rounded-full">{d.verified_purchase}</span>
              </div>
              <p className="text-sm opacity-80">{r.body}</p>
            </div>
          ))}
        </div>
        <form action={`/api/reviews`} method="post" className="grid gap-3 max-w-md">
          <input name="productId" type="hidden" value={p.id} />
          <input name="customerName" placeholder={d.full_name} required className="border rounded-lg px-3 py-2" />
          <input name="customerEmail" type="email" placeholder={d.email} required className="border rounded-lg px-3 py-2" />
          <select name="rating" className="border rounded-lg px-3 py-2">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
          </select>
          <textarea name="body" placeholder={d.write_review} required className="border rounded-lg px-3 py-2" />
          <p className="text-xs opacity-60">{lang === "ur" ? "صرف تصدیق شدہ خریداروں کے تجربات قبول کیے جاتے ہیں۔" : "Only verified purchases (matching email + order) can submit a review."}</p>
          <button className="bg-cinnamon text-white px-5 py-2 rounded-full w-fit">{d.submit_review}</button>
        </form>
      </section>
    </main>
  );
}
