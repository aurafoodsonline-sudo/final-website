import { Lang, t } from "@/lib/constants";

const FAQS = [
  { en: ["How is delivery calculated?", "Delivery is Rs. 150 on orders under Rs. 1,500 and free on orders of Rs. 1,500 or more. The exact total is always shown at checkout before you order."], ur: ["ڈیلیوری کیسے شمار ہوتی ہے؟", "1,500 روپے سے کم کے آرڈر پر ڈیلیوری 150 روپے ہے، اور 1,500 روپے یا اس سے زیادہ پر مفت۔ آرڈر سے پہلے چیک آؤٹ پر مکمل رقم دکھائی جاتی ہے۔"] },
  { en: ["Can I track my order?", "Yes. Use the Track Order page with your order reference and phone number."], ur: ["کیا میں اپنا آرڈر ٹریک کر سکتا ہوں؟", "جی ہاں۔ آرڈر نمبر اور فون نمبر کے ساتھ ٹریک آرڈر صفحہ استعمال کریں۔"] },
  { en: ["Can food products be returned?", "Returns are reviewed for unopened, damaged, or incorrectly supplied products per our return policy."], ur: ["کیا کھانے کی مصنوعات واپس کی جا سکتی ہیں؟", "غیر کھلی، خراب یا غلط بھیجی گئی مصنوعات کی واپسی کا جائزہ ہماری پالیسی کے تحت لیا جاتا ہے۔"] },
  { en: ["How do I request support?", "Use the Support page, or message us on WhatsApp with your order number."], ur: ["سپورٹ کیسے حاصل کروں؟", "سپورٹ صفحہ استعمال کریں، یا اپنے آرڈر نمبر کے ساتھ واٹس ایپ پر پیغام بھیجیں۔"] },
  { en: ["How should spices be stored?", "Keep spices sealed, dry, and away from sunlight, heat, and moisture."], ur: ["مصالحوں کو کیسے محفوظ رکھا جائے؟", "مصالحوں کو بند، خشک اور سورج کی روشنی، حرارت اور نمی سے دور رکھیں۔"] },
];

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <p data-reveal="fade" className="text-xs uppercase tracking-wide text-chili mb-2 text-center">{d.faq_badge}</p>
      <h1 data-reveal="up" className="font-heritage text-3xl md:text-4xl mb-2 text-center">{d.faq_title}</h1>
      <p data-reveal="fade" className="opacity-70 text-center mb-10">{d.faq_sub}</p>
      <div data-reveal="stagger" className="space-y-3">
        {FAQS.map((f, i) => {
          const [q, a] = lang === "ur" ? f.ur : f.en;
          return (
            <details key={i} className="group bg-white/70 rounded-xl p-4 border border-transparent transition-colors duration-300 open:border-turmeric/40 hover:border-cinnamon/15">
              <summary className="font-semibold cursor-pointer flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">{q}<span aria-hidden="true" className="text-chili text-xl leading-none transition-transform duration-300 group-open:rotate-45">+</span></summary>
              <p className="text-sm opacity-80 mt-2">{a}</p>
            </details>
          );
        })}
      </div>
    </main>
  );
}
