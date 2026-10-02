import { getT, getContent, getSiteInfo } from "@/lib/site";
import { getAllProducts } from "@/lib/data";
import { Lang, t } from "@/lib/constants";
import AboutCarousel from "@/components/AboutCarousel";
import AnimatedTitle from "@/components/motion/AnimatedTitle";
import CountUp from "@/components/reactbits/CountUp";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  const values = await getContent("value");
  const site = await getSiteInfo();
  const productCount = (await getAllProducts()).length;
  // Product count is live; partner-farm number is set in Admin → Settings.
  const STATS = [
    { to: productCount, suffix: "+", key: "stat_products" },
    { to: site.partnerFarms, suffix: "+", key: "stat_farms" },
    { to: 100, suffix: "%", key: "stat_promise" },
  ] as const;
  return (
    <main className="max-w-5xl mx-auto px-4 py-14">
      <p data-reveal="fade" className="eyebrow mb-3">{d.about_title}</p>
      <AnimatedTitle tag="h1" text={d.about_sub} lang={lang} align="start" className={`font-heritage text-4xl md:text-5xl mb-4 ${lang === "ur" ? "leading-[1.9]" : ""}`} />
      <p data-reveal="up" data-reveal-delay="0.2" className="opacity-80 max-w-2xl mb-12">{d.about_lead}</p>

      <div className="grid md:grid-cols-2 gap-10 items-center mb-14">
        <div data-reveal="clip"><AboutCarousel /></div>
        <div>
          <h2 data-reveal="up" className="font-heritage text-2xl md:text-3xl mb-3">{d.about_h2}</h2>
          <p data-reveal="up" data-reveal-delay="0.1" className="opacity-80">{d.about_h2_body}</p>
          <div data-reveal="stagger" className="grid grid-cols-3 gap-4 mt-8 text-center">
            {STATS.map((st) => (
              <div key={st.key} className="rounded-2xl bg-white/70 px-2 py-4 border border-cinnamon/10">
                <p className="text-3xl md:text-4xl font-heritage text-chili" aria-label={`${st.to}${st.suffix}`}>
                  <CountUp to={st.to} duration={2.2} />{st.suffix}
                </p>
                <p className="text-xs opacity-70 mt-1">{d[st.key]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatedTitle text={d.our_values} lang={lang} className="block font-heritage text-3xl md:text-4xl mb-2 w-full" />
      <p data-reveal="fade" className="text-center opacity-70 mb-10">{d.what_we_stand_for}</p>
      <div data-reveal="stagger" className="grid md:grid-cols-3 gap-6">
        {values.map((v, i) => {
          const [title, desc] = lang === "ur" ? [v.titleUr, v.bodyUr] : [v.titleEn, v.bodyEn];
          return (
            <SpotlightCard key={i} spotlightColor="rgba(232, 163, 61, 0.30)" className="h-full rounded-2xl border border-cinnamon/10 bg-white/75 p-6 text-center transition-transform duration-500 hover:-translate-y-1">
              <h3 className="font-semibold text-chili mb-1">{title}</h3>
              <p className="text-sm opacity-80">{desc}</p>
            </SpotlightCard>
          );
        })}
      </div>
    </main>
  );
}
