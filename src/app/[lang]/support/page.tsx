import { Lang, t } from "@/lib/constants";

export default async function SupportPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { lang: rawLang } = await params;
  const { sent } = await searchParams;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-lg mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-2 text-center">{d.support_title}</h1>
      <p className="opacity-70 text-center mb-8">{d.support_sub}</p>
      <form action="/api/support" method="post" className="grid gap-3 bg-white/70 rounded-2xl p-6">
        {sent ? <p role="status" className="rounded-lg bg-cardamom/15 text-cardamom px-3 py-2 text-sm">{lang === "ur" ? "شکریہ! آپ کا ٹکٹ موصول ہو گیا ہے۔ ہماری ٹیم جلد آپ سے رابطہ کرے گی۔" : "Thank you! Your ticket has been received. Our team will contact you soon."}</p> : null}
        <input name="orderNumber" placeholder={d.order_ref} className="border rounded-lg px-3 py-2" />
        <select name="category" className="border rounded-lg px-3 py-2">
          <option>Order</option><option>Delivery</option><option>Returns</option><option>Refund</option><option>Complaint</option><option>Wholesale</option>
        </select>
        <input name="subject" placeholder={d.subject} required className="border rounded-lg px-3 py-2" />
        <textarea name="message" placeholder={d.message} required className="border rounded-lg px-3 py-2" rows={4} />
        <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">{d.create_ticket}</button>
      </form>
    </main>
  );
}
