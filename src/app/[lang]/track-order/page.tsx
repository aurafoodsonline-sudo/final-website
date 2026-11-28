import { pageMetadata } from "@/lib/seo";
import { getT } from "@/lib/site";
import { Lang, t } from "@/lib/constants";
import TrackOrderForm from "@/components/TrackOrderForm";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const lang = (await params).lang === "ur" ? "ur" : "en";
  return pageMetadata(lang, "/track-order", lang === "ur"
    ? { title: "اپنا آرڈر ٹریک کریں", description: "اپنے آرڈر کی تفصیلات سے آورا فوڈز آرڈر کی موجودہ صورتحال دیکھیں۔" }
    : { title: "Track Your Order", description: "Check your Aura Foods order status using your order details." });
}

export default async function TrackOrderPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  return (
    <main className="max-w-md mx-auto px-4 py-14 text-center">
      <p className="text-xs uppercase tracking-wide text-chili mb-2">{d.track_badge}</p>
      <h1 className="font-heritage text-3xl mb-2">{d.track_title}</h1>
      <p className="opacity-70 mb-8">{d.track_sub}</p>
      <TrackOrderForm lang={lang} />
    </main>
  );
}
