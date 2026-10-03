import { getT, getContent, getSiteInfo } from "@/lib/site";
import { Lang, t } from "@/lib/constants";
import { deliveryRuleText } from "@/lib/pricing";

// Rendered on each visit so the delivery answer always matches Admin → Settings.
export const dynamic = "force-dynamic";

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  const deliveryRule = deliveryRuleText(lang, (await getSiteInfo()).delivery);
  const faqs = await getContent("faq");
  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <p data-reveal="fade" className="text-xs uppercase tracking-wide text-chili mb-2 text-center">{d.faq_badge}</p>
      <h1 data-reveal="up" className="font-heritage text-3xl md:text-4xl mb-2 text-center">{d.faq_title}</h1>
      <p data-reveal="fade" className="opacity-70 text-center mb-10">{d.faq_sub}</p>
      <div data-reveal="stagger" className="space-y-3">
        {faqs.map((f, i) => {
          const [q, a] = lang === "ur" ? [f.titleUr || f.titleEn, f.bodyUr || f.bodyEn] : [f.titleEn, f.bodyEn];
          return (
            <details key={i} className="group bg-white/70 rounded-xl p-4 border border-transparent transition-colors duration-300 open:border-turmeric/40 hover:border-cinnamon/15">
              <summary className="font-semibold cursor-pointer flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">{q}<span aria-hidden="true" className="text-chili text-xl leading-none transition-transform duration-300 group-open:rotate-45">+</span></summary>
              <p className="text-sm opacity-80 mt-2">{a.replaceAll("{delivery_rule}", deliveryRule)}</p>
            </details>
          );
        })}
      </div>
    </main>
  );
}
