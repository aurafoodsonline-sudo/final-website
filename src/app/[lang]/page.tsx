import Image from "next/image";
import Link from "next/link";
import { Lang, t, SOCIAL_LINKS } from "@/lib/constants";
import { getAllProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

const WHY = [
  { en: ["100% Organic", "Sourced from trusted Pakistani farms without synthetic chemicals."], ur: ["100% آرگینک", "قابلِ اعتماد پاکستانی کھیتوں سے حاصل شدہ، کیمیکل سے پاک۔"] },
  { en: ["No Preservatives", "Nothing artificial added. Ever. Just pure spice."], ur: ["کوئی پریزرویٹو نہیں", "کبھی بھی مصنوعی چیز شامل نہیں۔ صرف خالص مصالحہ۔"] },
  { en: ["No Artificial Colors", "Pure pigment comes from the spice itself."], ur: ["کوئی مصنوعی رنگ نہیں", "خالص رنگ مصالحے سے ہی آتا ہے۔"] },
  { en: ["Hygienically Packed", "Sealed in food-grade facilities with strict quality control."], ur: ["حفظان صحت کے ساتھ پیک", "فوڈ گریڈ سہولیات میں سختی سے پیک شدہ۔"] },
  { en: ["Fast Delivery", "Across Pakistan in 2-4 business days. Track your order."], ur: ["تیز ڈیلیوری", "پاکستان بھر میں 2-4 دنوں میں۔ آرڈر ٹریک کریں۔"] },
  { en: ["Fresh Aroma", "Ground in small batches weekly to preserve essential oils."], ur: ["تازہ خوشبو", "ہر ہفتے چھوٹے بیچوں میں پیسا جاتا ہے۔"] },
];

const TESTIMONIALS = [
  { en: ["Ayesha K.", "Karachi", "The Kunri chili is unreal — the colour, the aroma, exactly what my mother used to buy from the village."], ur: ["عائشہ ک.", "کراچی", "کنری کی مرچ بے مثال ہے — رنگ، خوشبو، بالکل ویسی جیسی امی گاؤں سے خریدتی تھیں۔"] },
  { en: ["Bilal R.", "Lahore", "Switched my whole pantry to Aura. The garam masala makes a difference you can smell from the next room."], ur: ["بلال ر.", "لاہور", "اپنا سارا پینٹری آورا پر شفٹ کر دیا۔ گرم مصالحہ کی خوشبو دور سے آتی ہے۔"] },
  { en: ["Sana M.", "Islamabad", "Beautifully packed, super fresh, and delivered in two days."], ur: ["ثناء م.", "اسلام آباد", "خوبصورت پیکنگ، بہت تازہ، اور دو دن میں ڈیلیوری۔"] },
];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  const products = await getAllProducts();
  const bestSellers = products.filter((p) => p.bestSeller);
  const newArrivals = products.filter((p) => p.newArrival);

  return (
    <main>
      <section
        className="relative overflow-hidden bg-[#FBF3E7]"
      >
        <div className="relative mx-auto w-full max-w-6xl aspect-[1122/1402]">
          <Image
            src="/images/home-banner.jpg"
            alt="Aura Foods organic spices"
            width={1122}
            height={1402}
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div className="absolute inset-x-0 top-[16%] mx-auto max-w-2xl px-4 text-center text-[#1a0d08]">
            <span className="inline-block text-xs md:text-sm uppercase tracking-wide bg-[#FBF3E7]/80 text-[#1a0d08] px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-3 md:mb-5">{d.hero_badge}</span>
            <h1 className="font-heritage text-3xl md:text-7xl leading-tight font-semibold md:font-normal text-[#1a0d08]">{d.hero_title}</h1>
            <p className="mt-3 md:mt-5 text-base md:text-2xl font-medium md:font-normal text-[#1a0d08]">{d.hero_sub}</p>
            <div className="mt-5 md:mt-7 flex justify-center gap-2 md:gap-3">
              <Link href={`/${lang}/shop`} className="bg-chili text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-base md:text-lg font-medium shadow-md hover:opacity-90">{d.hero_cta}</Link>
              <Link href={`/${lang}/about`} className="border border-cinnamon bg-[#FBF3E7]/75 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-base md:text-lg font-medium shadow-md hover:bg-[#FBF3E7]">{d.hero_cta2}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-heritage text-3xl text-center mb-8">{d.best_sellers}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {bestSellers.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}
        </div>
      </section>

      <section className="bg-cardamom/10 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heritage text-3xl text-center mb-8">{d.why_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY.map((w, i) => {
              const [title, desc] = lang === "ur" ? w.ur : w.en;
              return (
                <div key={i} className="bg-white/70 rounded-2xl p-5">
                  <h3 className="font-semibold text-chili mb-1">{title}</h3>
                  <p className="text-sm opacity-80">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-heritage text-3xl text-center mb-8">{d.new_arrivals}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {newArrivals.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}
        </div>
      </section>

      <section className="bg-cinnamon/5 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heritage text-3xl text-center mb-8">{d.testimonials}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((tm, i) => {
              const [name, city, text] = lang === "ur" ? tm.ur : tm.en;
              return (
                <div key={i} className="bg-white/70 rounded-2xl p-5">
                  <p className="text-sm italic opacity-90">&ldquo;{text}&rdquo;</p>
                  <p className="text-sm font-semibold mt-3 text-chili">{name} — {city}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14 text-center">
        <h2 className="font-heritage text-2xl mb-3">{d.newsletter_title}</h2>
        <a href={SOCIAL_LINKS.whatsapp} className="inline-block bg-cardamom text-white px-6 py-3 rounded-full font-medium">{d.order_whatsapp}</a>
      </section>
    </main>
  );
}
