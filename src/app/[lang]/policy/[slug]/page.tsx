import { Lang } from "@/lib/constants";
import { notFound } from "next/navigation";

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
    en: ["Shipping Policy", "We deliver across Pakistan, usually within 2-4 business days. Delivery is Rs. 150 on orders under Rs. 1,500 and free above that; the exact total is shown at checkout."],
    ur: ["شپنگ پالیسی", "ہم پاکستان بھر میں عام طور پر 2 سے 4 کاروباری دنوں میں ڈیلیوری کرتے ہیں۔ 1,500 روپے سے کم کے آرڈر پر ڈیلیوری 150 روپے ہے، اس سے زیادہ پر مفت۔"],
  },
  "terms": {
    en: ["Terms & Conditions", "By placing an order with Aura Foods you agree to our order confirmation, payment, and delivery processes as described on this site."],
    ur: ["شرائط و ضوابط", "آورا فوڈز کے ساتھ آرڈر دے کر آپ ہماری آرڈر کنفرمیشن، ادائیگی اور ڈیلیوری کی شرائط سے اتفاق کرتے ہیں۔"],
  },
};

export default async function PolicyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const policy = POLICIES[slug];
  if (!policy) return notFound();
  const [title, body] = lang === "ur" ? policy.ur : policy.en;
  return (
    <main className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-4">{title}</h1>
      <p className="opacity-80 leading-relaxed">{body}</p>
    </main>
  );
}
