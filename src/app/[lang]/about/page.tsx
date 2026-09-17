import { Lang, t } from "@/lib/constants";
import Image from "next/image";

const VALUES = [
  { en: ["100% Organic", "Sourced from trusted Pakistani farms without synthetic chemicals."], ur: ["100% آرگینک", "قابلِ اعتماد پاکستانی کھیتوں سے، کیمیکل سے پاک۔"] },
  { en: ["No Preservatives", "Nothing artificial added. Ever."], ur: ["کوئی پریزرویٹو نہیں", "کبھی مصنوعی چیز شامل نہیں۔"] },
  { en: ["Hygienically Packed", "Sealed in food-grade facilities."], ur: ["حفظان صحت کے ساتھ پیک", "فوڈ گریڈ سہولیات میں پیک شدہ۔"] },
];

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-5xl mx-auto px-4 py-14">
      <p className="text-xs uppercase tracking-wide text-chili mb-2">{d.about_title}</p>
      <h1 className="font-heritage text-4xl mb-3">{d.about_sub}</h1>
      <p className="opacity-80 max-w-2xl mb-10">{d.about_lead}</p>

      <div className="grid md:grid-cols-2 gap-10 items-center mb-14">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <Image src="/images/story.jpg" alt="Aura Foods story" fill className="object-cover" />
        </div>
        <div>
          <h2 className="font-heritage text-2xl mb-2">{d.about_h2}</h2>
          <p className="opacity-80">{d.about_h2_body}</p>
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div><p className="text-2xl font-heritage text-chili">8+</p><p className="text-xs opacity-70">{d.stat_products}</p></div>
            <div><p className="text-2xl font-heritage text-chili">50+</p><p className="text-xs opacity-70">{d.stat_farms}</p></div>
            <div><p className="text-2xl font-heritage text-chili">100%</p><p className="text-xs opacity-70">{d.stat_promise}</p></div>
          </div>
        </div>
      </div>

      <h2 className="font-heritage text-2xl text-center mb-2">{d.our_values}</h2>
      <p className="text-center opacity-70 mb-8">{d.what_we_stand_for}</p>
      <div className="grid md:grid-cols-3 gap-6">
        {VALUES.map((v, i) => {
          const [title, desc] = lang === "ur" ? v.ur : v.en;
          return (
            <div key={i} className="bg-white/70 rounded-2xl p-5 text-center">
              <h3 className="font-semibold text-chili mb-1">{title}</h3>
              <p className="text-sm opacity-80">{desc}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
