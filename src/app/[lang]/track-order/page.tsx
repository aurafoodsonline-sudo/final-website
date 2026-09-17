import { Lang, t } from "@/lib/constants";

export default async function TrackOrderPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-md mx-auto px-4 py-14 text-center">
      <p className="text-xs uppercase tracking-wide text-chili mb-2">{d.track_badge}</p>
      <h1 className="font-heritage text-3xl mb-2">{d.track_title}</h1>
      <p className="opacity-70 mb-8">{d.track_sub}</p>
      <form action="/api/track-order" method="get" className="grid gap-3 text-left">
        <input name="orderNumber" placeholder={d.order_ref} required className="border rounded-lg px-3 py-2" />
        <input name="phone" placeholder={d.phone} required className="border rounded-lg px-3 py-2" />
        <button className="bg-chili text-white px-5 py-2 rounded-full">{d.track_btn}</button>
      </form>
    </main>
  );
}
