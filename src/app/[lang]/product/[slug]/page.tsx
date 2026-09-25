import Image from "next/image";
import type { Metadata } from "next";
import { Lang, t, SITE_URL } from "@/lib/constants";
import { getProductBySlug, getApprovedReviews } from "@/lib/data";
import { notFound } from "next/navigation";
import ProductPurchase from "@/components/ProductPurchase";
import { parseGrammageOptions } from "@/lib/grammage";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p || p.isHidden) return {};
  const isUr = lang === "ur";
  // Empty admin fields fall back to the product's own name/tagline/URL.
  return {
    title: (isUr ? p.metaTitleUr || p.nameUr : p.metaTitleEn || p.nameEn),
    description: (isUr ? p.metaDescriptionUr || p.taglineUr : p.metaDescriptionEn || p.taglineEn) || "",
    alternates: { canonical: p.canonicalUrl || `${SITE_URL}/${lang}/product/${slug}` },
    robots: p.noIndex ? { index: false } : undefined,
  };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ lang: string; slug: string }>; searchParams: Promise<{ review?: string }> }) {
  const { lang: rawLang, slug } = await params;
  const { review: reviewStatus } = await searchParams;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  const p = await getProductBySlug(slug);
  if (!p || p.isHidden) return notFound();
  const reviews = await getApprovedReviews(p.id);
  const name = lang === "ur" ? p.nameUr : p.nameEn;
  const image = p.image || "/images/logo.jpg";
  const alt = (lang === "ur" ? p.imageAltUr : p.imageAltEn) || name;
  const ur = lang === "ur";
  const reviewMessages: Record<string, { ok: boolean; text: string }> = {
    thanks: { ok: true, text: ur ? "شکریہ! آپ کا ریویو منظوری کے بعد شائع ہو گا۔" : "Thank you! Your review will appear after it is approved." },
    unverified: { ok: false, text: ur ? "اس ای میل سے اس پروڈکٹ کا کوئی آرڈر نہیں ملا۔ وہی ای میل استعمال کریں جو آرڈر کرتے وقت دی تھی۔" : "We couldn't find an order for this product with that email. Please use the same email you gave at checkout." },
    missing: { ok: false, text: ur ? "براہ کرم تمام خانے پُر کریں۔" : "Please fill in all the fields." },
  };
  const reviewMessage = reviewStatus ? reviewMessages[reviewStatus] : undefined;
  const grammageOptions = parseGrammageOptions(p.grammageOptions, p.weightLabel, p.price);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: `${SITE_URL}${image}`,
    description: lang === "ur" ? p.descriptionUr : p.descriptionEn,
    offers: { "@type": "Offer", price: grammageOptions[0]?.price ?? p.price, priceCurrency: "PKR", availability: p.websiteStockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
    ...(avgRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: reviews.length } } : {}),
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white">
          <Image src={image} unoptimized={image.startsWith("/uploads/")} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div>
          <h1 className="font-heritage text-3xl mb-1">{name}</h1>
          <p className="opacity-70 mb-4">{lang === "ur" ? p.taglineUr : p.taglineEn}</p>
          {p.websiteStockStatus === "limited" ? <p className="text-sm text-chili font-medium mb-3">{d.limited_stock}</p> : null}
          {p.websiteStockStatus === "out_of_stock" ? (
            <div className="mb-6">
              <p className="text-2xl font-semibold text-chili mb-1">Rs. {grammageOptions[0]?.price ?? p.price}</p>
              <p className="text-cinnamon font-medium">{d.out_of_stock}</p>
            </div>
          ) : (
            <div className="mb-6">
              <ProductPurchase
                options={grammageOptions}
                product={{ id: p.id, slug: p.slug, name, image }}
                sizeLabel={ur ? "سائز" : "Size"}
                oldPrice={p.oldPrice}
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

      <section id="reviews" className="mt-14 scroll-mt-24">
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
        {reviewMessage && (
          <p role="status" className={`max-w-md mb-4 rounded-lg px-3 py-2 text-sm ${reviewMessage.ok ? "bg-cardamom/15 text-cardamom" : "bg-chili/10 text-chili"}`}>{reviewMessage.text}</p>
        )}
        <h3 className="font-semibold mb-3">{d.write_review}</h3>
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
