import { Lang, t } from "@/lib/constants";

const POLICIES: Record<string, { en: [string, string]; ur: [string, string] }> = {
  "privacy-policy": {
    en: ["Privacy Policy", "Aura Foods collects only the information needed to process and deliver your order (name, phone, address, email). We do not sell customer data to third parties."],
    ur: ["پرائیویسی پالیسی", "آورا فوڈز صرف آپ کا آرڈر مکمل کرنے کے لیے درکار معلومات جمع کرتا ہے (نام، فون، پتہ، ای میل)۔ ہم صارف کا ڈیٹا فروخت نہیں کرتے۔"],
  },
  "return-policy": {
    en: ["Return & Refund Policy", "Unopened, damaged, or incorrectly supplied items are eligible for review within 3 days of delivery. Contact support with your order number."],
    ur: ["واپسی اور رقم کی واپسی کی پالیسی", "غیر کھلی، خراب یا غلط بھیجی گئی اشیاء ڈیلیوری کے 3 دن کے اندر جائزے کے لیے اہل ہیں۔"],
  },
  "shipping-policy": {
    en: ["Shipping Policy", "We deliver across Pakistan. Delivery charges and estimated timelines are shown at checkout based on your city."],
    ur: ["شپنگ پالیسی", "ہم پاکستان بھر میں ڈیلیوری کرتے ہیں۔ ڈیلیوری چارجز اور وقت آپ کے شہر کی بنیاد پر چیک آؤٹ پر دکھائے جاتے ہیں۔"],
  },
  "terms": {
    en: ["Terms & Conditions", "By placing an order with Aura Foods you agree to our order confirmation, payment, and delivery processes as described on this site."],
    ur: ["شرائط و ضوابط", "آورا فوڈز کے ساتھ آرڈر دے کر آپ ہماری آرڈر کنفرمیشن، ادائیگی اور ڈیلیوری کی شرائط سے اتفاق کرتے ہیں۔"],
  },
};

export default async function PolicyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const policy = POLICIES[slug] ?? POLICIES["terms"];
  const [title, body] = lang === "ur" ? policy.ur : policy.en;
  return (
    <main className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-4">{title}</h1>
      <p className="opacity-80 leading-relaxed">{body}</p>
    </main>
  );
}
