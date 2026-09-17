import { Lang, t } from "@/lib/constants";

const FAQS = [
  { en: ["How is delivery calculated?", "Delivery charges are calculated server-side by city and order subtotal. The final checkout total is authoritative."], ur: ["ڈیلیوری کیسے شمار ہوتی ہے؟", "ڈیلیوری چارجز شہر اور آرڈر کی رقم کی بنیاد پر سرور پر شمار کیے جاتے ہیں۔"] },
  { en: ["Can I track my order?", "Yes. Use the Track Order page with your order reference and phone number."], ur: ["کیا میں اپنا آرڈر ٹریک کر سکتا ہوں؟", "جی ہاں۔ آرڈر نمبر اور فون نمبر کے ساتھ ٹریک آرڈر صفحہ استعمال کریں۔"] },
  { en: ["Can food products be returned?", "Returns are reviewed for unopened, damaged, or incorrectly supplied products per our return policy."], ur: ["کیا کھانے کی مصنوعات واپس کی جا سکتی ہیں؟", "غیر کھلی، خراب یا غلط بھیجی گئی مصنوعات کی واپسی کا جائزہ ہماری پالیسی کے تحت لیا جاتا ہے۔"] },
  { en: ["How do I request support?", "Use the Support page or the Order Support link inside your customer account."], ur: ["سپورٹ کیسے حاصل کروں؟", "سپورٹ صفحہ یا اپنے اکاؤنٹ میں آرڈر سپورٹ لنک استعمال کریں۔"] },
  { en: ["How should spices be stored?", "Keep spices sealed, dry, and away from sunlight, heat, and moisture."], ur: ["مصالحوں کو کیسے محفوظ رکھا جائے؟", "مصالحوں کو بند، خشک اور سورج کی روشنی، حرارت اور نمی سے دور رکھیں۔"] },
];

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <p className="text-xs uppercase tracking-wide text-chili mb-2 text-center">{d.faq_badge}</p>
      <h1 className="font-heritage text-3xl mb-2 text-center">{d.faq_title}</h1>
      <p className="opacity-70 text-center mb-10">{d.faq_sub}</p>
      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const [q, a] = lang === "ur" ? f.ur : f.en;
          return (
            <details key={i} className="bg-white/70 rounded-xl p-4">
              <summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="text-sm opacity-80 mt-2">{a}</p>
            </details>
          );
        })}
      </div>
    </main>
  );
}
