import { Lang } from "@/lib/constants";

import Link from "next/link";
import { redirect } from "next/navigation";
import { PHONE_DISPLAY, SOCIAL_LINKS } from "@/lib/constants";

export default async function OrderConfirmedPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ ref?: string; phone?: string; wa?: string; total?: string }> }) {
  const { lang: rawLang } = await params;
  const { ref, phone, wa, total } = await searchParams;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  if (!ref) redirect(`/${lang}/shop`);
  const chatMessage = encodeURIComponent(`Assalam-o-Alaikum Aura Foods, Order ID #${ref ?? ""} ke bare me pochna tha`);
  const chatUrl = `${SOCIAL_LINKS.whatsapp}?text=${chatMessage}`;
  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="font-heritage text-3xl mb-3 text-chili">
        {lang === "ur" ? "✓ آرڈر کنفرم ہو گیا!" : "✓ Order Confirmed!"}
      </h1>
      <p className="opacity-80 mb-2">
        {lang === "ur" ? `آپ کا آرڈر نمبر: ${ref}` : `Your order reference: ${ref}`}
      </p>
      {total ? <p className="font-semibold mb-2">{lang === "ur" ? `کل رقم (کیش آن ڈیلیوری): Rs. ${total}` : `Total to pay on delivery: Rs. ${total}`}</p> : null}
      <p className="text-sm opacity-70 mb-6">
        {wa === "sent"
          ? (lang === "ur" ? `واٹس ایپ تصدیق ${phone || PHONE_DISPLAY} پر بھیج دی گئی ہے۔` : `WhatsApp confirmation sent to ${phone || PHONE_DISPLAY}.`)
          : (lang === "ur" ? "آپ کا آرڈر محفوظ ہو گیا ہے۔ ہماری ٹیم تصدیق کے لیے جلد آپ سے رابطہ کرے گی۔" : "Your order is saved. Our team will contact you shortly to confirm it.")}
      </p>
      <p className="text-xs opacity-60 mb-6">{lang === "ur" ? "یہ آرڈر نمبر محفوظ رکھیں — آرڈر ٹریک کرنے کے لیے درکار ہو گا۔" : "Keep this order reference — you'll need it to track your order."}</p>
      <div className="grid gap-3">
        <Link href={`/${lang}/track-order`} className="border border-chili text-chili px-5 py-3 rounded-full">{lang === "ur" ? "آرڈر ٹریک کریں" : "Track this order"}</Link>
        <Link href={`/${lang}/shop`} className="bg-chili text-white px-5 py-3 rounded-full">{lang === "ur" ? "خریداری جاری رکھیں" : "Continue Shopping"}</Link>
        <a href={chatUrl} className="bg-cardamom text-white px-5 py-3 rounded-full">{lang === "ur" ? "واٹس ایپ پر چیٹ کریں" : "Chat on WhatsApp"}</a>
      </div>
    </main>
  );
}
