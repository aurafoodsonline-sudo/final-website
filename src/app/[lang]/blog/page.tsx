import { Lang, t } from "@/lib/constants";
import Image from "next/image";

const POSTS = [
  { slug: "turmeric-benefits", category: "Wellness", read: "4 min", en: ["The Health Benefits of Daily Turmeric", "Why a daily pinch of golden turmeric has been a household staple for generations."], ur: ["روزانہ ہلدی کے صحت کے فوائد", "روزانہ ایک چٹکی سنہری ہلدی نسلوں سے گھروں کا حصہ کیوں رہی ہے۔"] },
  { slug: "bbq-spices", category: "Cooking", read: "6 min", en: ["Best Spices for the Perfect BBQ Night", "The blends that turn an ordinary grill night into something people remember."], ur: ["بہترین بار بی کیو نائٹ کے مصالحے", "وہ امتزاج جو عام گرل نائٹ کو یادگار بنا دیتے ہیں۔"] },
  { slug: "spice-heritage", category: "Heritage", read: "5 min", en: ["Inside Our Spice Heritage", "How Aura Foods traces every spice back to the farms and mills we trust."], ur: ["ہماری مصالحہ وراثت کی جھلک", "آورا فوڈز ہر مصالحے کو قابلِ اعتماد فارمز اور چکیوں تک کیسے ٹریس کرتا ہے۔"] },
];

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-5xl mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-8 text-center">{d.nav_blog}</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {POSTS.map((p) => {
          const [title, excerpt] = lang === "ur" ? p.ur : p.en;
          return (
            <div key={p.slug} className="rounded-2xl bg-white/70 overflow-hidden border border-cinnamon/10">
              <div className="relative aspect-video"><Image src={`/images/blog-${p.slug}.jpg`} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
              <div className="p-4">
                <p className="text-xs text-chili mb-1">{p.category} · {p.read}</p>
                <h3 className="font-heritage text-lg mb-1">{title}</h3>
                <p className="text-sm opacity-75">{excerpt}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
