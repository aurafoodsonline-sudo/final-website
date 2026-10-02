import { getT, getSiteInfo, getContent } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { Lang } from "@/lib/constants";
import { getAllProducts, getAllBundles } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import BundleCard from "@/components/BundleCard";
import AnimatedTitle from "@/components/motion/AnimatedTitle";
import HeroMotion from "@/components/motion/HeroMotion";
import SpiceMarquee from "@/components/motion/SpiceMarquee";
import ShinyText from "@/components/reactbits/ShinyText";
import BlurText from "@/components/reactbits/BlurText";
import Magnet from "@/components/reactbits/Magnet";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import StarBorder from "@/components/reactbits/StarBorder";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  const products = await getAllProducts();
  const site = await getSiteInfo();
  const why = await getContent("why");
  const testimonials = await getContent("testimonial");
  const bundles = await getAllBundles();
  const bestSellers = products.filter((p) => p.bestSeller);
  const newArrivals = products.filter((p) => p.newArrival);
  const ur = lang === "ur";
  const spiceNames = products.map((p) => (ur ? p.nameUr : p.nameEn)).filter(Boolean);

  const grid = (items: typeof products) => (
    <div data-reveal="stagger" className="flex flex-wrap justify-center gap-4 md:gap-5">
      {items.map((p) => (
        <div key={p.id} className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.9375rem)]">
          <ProductCard p={p} lang={lang} />
        </div>
      ))}
    </div>
  );

  return (
    <main>
      <section className="relative overflow-hidden bg-[#FBF3E7]">
        <HeroMotion
          className="relative mx-auto w-full max-w-6xl aspect-[1122/1402] overflow-hidden rounded-[2rem]"
          image={
            <Image
              src="/images/home-banner.jpg"
              alt="Aura Foods organic spices"
              width={922}
              height={1152}
              priority
              sizes="100vw"
              className="hero-banner-fade absolute inset-0 h-full w-full object-contain"
            />
          }
        >
          <div className="absolute inset-x-0 top-[7%] md:top-[16%] mx-auto max-w-xl md:max-w-2xl px-4 text-center text-cinnamon">
            <span className="inline-block text-xs md:text-sm uppercase tracking-wide bg-[#FBF3E7]/80 px-3 md:px-4 py-1 md:py-1.5 rounded-full mb-3 md:mb-5 shadow-sm backdrop-blur-sm">
              <ShinyText text={d.hero_badge} color="#4A2C1D" shineColor="#E8A33D" speed={3.2} delay={1.2} spread={110} />
            </span>
            <AnimatedTitle
              tag="h1"
              text={d.hero_title}
              lang={lang}
              className={`font-heritage text-3xl md:text-7xl font-semibold md:font-normal drop-shadow-sm ${ur ? "leading-[1.9]" : "leading-tight"}`}
            />
            <div className="hidden md:block">
              {ur ? (
                <p data-reveal="fade" data-reveal-delay="0.6" className="mt-5 text-2xl opacity-90 drop-shadow-sm">{d.hero_sub}</p>
              ) : (
                <BlurText text={d.hero_sub} delay={70} animateBy="words" direction="bottom" className="mt-5 justify-center text-2xl opacity-90 drop-shadow-sm" />
              )}
            </div>
            <div data-reveal="up" data-reveal-delay="0.5" className="mt-5 md:mt-7 flex justify-center gap-2 md:gap-3">
              <Magnet padding={60} magnetStrength={4}>
                <Link href={`/${lang}/shop`} className="inline-block bg-chili text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-base md:text-lg font-medium shadow-md transition-shadow hover:shadow-[0_12px_30px_-10px_rgba(193,68,14,0.9)]">{d.hero_cta}</Link>
              </Magnet>
              <Magnet padding={60} magnetStrength={4}>
                <Link href={`/${lang}/about`} className="inline-block border border-cinnamon bg-[#FBF3E7]/75 px-4 md:px-6 py-2.5 md:py-3 rounded-full text-base md:text-lg font-medium shadow-md backdrop-blur-sm transition-colors hover:bg-[#FBF3E7]">{d.hero_cta2}</Link>
              </Magnet>
            </div>
          </div>
          <p className="absolute inset-x-0 top-[82%] px-4 text-center text-base text-cinnamon opacity-90 drop-shadow-sm md:hidden">{d.hero_sub}</p>
        </HeroMotion>
      </section>

      <SpiceMarquee names={spiceNames} lang={lang} />

      {newArrivals.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 md:pt-24">
          <div className="text-center mb-10">
            <p data-reveal="fade" className="eyebrow justify-center mb-3">{ur ? "تازہ پیسے ہوئے" : "Fresh from the mill"}</p>
            <AnimatedTitle text={d.new_arrivals} lang={lang} className="font-heritage text-3xl md:text-5xl" />
          </div>
          {grid(newArrivals)}
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 md:pb-24">
          <div className="text-center mb-10">
            <p data-reveal="fade" className="eyebrow justify-center mb-3">{ur ? "سب سے زیادہ پسندیدہ" : "Kitchen favourites"}</p>
            <AnimatedTitle text={d.best_sellers} lang={lang} className="font-heritage text-3xl md:text-5xl" />
          </div>
          {grid(bestSellers)}
        </section>
      )}

      {bundles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-6 pb-16 md:pb-24">
          <div className="text-center mb-10">
            <p data-reveal="fade" className="eyebrow justify-center mb-3">{ur ? "ایک ساتھ، زیادہ بچت" : "Better together"}</p>
            <AnimatedTitle text={ur ? "خصوصی بنڈلز" : "Special Bundles"} lang={lang} className="font-heritage text-3xl md:text-5xl" />
          </div>
          <div data-reveal="stagger" className="flex flex-wrap justify-center gap-4 md:gap-5">
            {bundles.map((b) => (
              <div key={b.id} className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.84rem)]">
                <BundleCard bundle={b} lang={lang} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grain relative overflow-hidden bg-cardamom/10 py-16 md:py-24">
        <div aria-hidden="true" data-speed="0.35" className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-turmeric/25 blur-3xl" />
        <div aria-hidden="true" data-speed="-0.3" className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-chili/15 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p data-reveal="fade" className="eyebrow justify-center mb-3">{ur ? "ہمارا وعدہ" : "Our promise"}</p>
            <AnimatedTitle text={d.why_title} lang={lang} className="font-heritage text-3xl md:text-5xl" />
          </div>
          <div data-reveal="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {why.map((w, i) => {
              const [title, desc] = ur ? [w.titleUr, w.bodyUr] : [w.titleEn, w.bodyEn];
              return (
                <SpotlightCard
                  key={i}
                  spotlightColor="rgba(232, 163, 61, 0.30)"
                  className="group h-full rounded-2xl border border-cinnamon/10 bg-white/75 p-6 transition-transform duration-500 hover:-translate-y-1"
                >
                  <span className="font-heritage text-4xl text-turmeric/70 transition-colors duration-500 group-hover:text-chili">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-semibold text-chili mb-1">{title}</h3>
                  <p className="text-sm opacity-80">{desc}</p>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-cinnamon/5 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p data-reveal="fade" className="eyebrow justify-center mb-3">{ur ? "آپ کی زبانی" : "In their words"}</p>
            <AnimatedTitle text={d.testimonials} lang={lang} className="font-heritage text-3xl md:text-5xl" />
          </div>
          <div data-reveal="stagger" className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => {
              const [name, city, text] = ur ? [tm.titleUr, tm.extraUr ?? "", tm.bodyUr] : [tm.titleEn, tm.extraEn ?? "", tm.bodyEn];
              return (
                <figure key={i} className="relative h-full rounded-2xl bg-white/80 p-6 pt-10 shadow-[0_18px_40px_-28px_rgba(74,44,29,0.6)] transition-transform duration-500 hover:-rotate-1 hover:-translate-y-1">
                  <span aria-hidden="true" className="absolute top-2 start-5 font-heritage text-6xl leading-none text-turmeric/60">&ldquo;</span>
                  <blockquote className="text-sm italic opacity-90">{text}</blockquote>
                  <figcaption className="text-sm font-semibold mt-4 text-chili">{name} — {city}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
        <AnimatedTitle text={d.newsletter_title} lang={lang} className="font-heritage text-3xl md:text-4xl mb-6" />
        <div data-reveal="zoom" className="mt-6">
          <Magnet padding={50} magnetStrength={5}>
            <StarBorder
              as="a"
              href={site.whatsappUrl}
              color="#E8A33D"
              speed="5s"
              thickness={2}
              backgroundColor="#6B8E4E"
              textColor="#ffffff"
              borderColor="rgba(255,255,255,0.15)"
              className="rounded-full [&>div:last-child]:rounded-full [&>div:last-child]:py-3 [&>div:last-child]:px-7 [&>div:last-child]:font-medium"
            >
              {d.order_whatsapp}
            </StarBorder>
          </Magnet>
        </div>
      </section>
    </main>
  );
}
