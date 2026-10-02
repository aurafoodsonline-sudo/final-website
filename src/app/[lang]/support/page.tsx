import { getT } from "@/lib/site";
import { Lang, t } from "@/lib/constants";

export default async function SupportPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { lang: rawLang } = await params;
  const { sent, error } = await searchParams;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  return (
    <main className="max-w-lg mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-2 text-center">{d.support_title}</h1>
      <p className="opacity-70 text-center mb-8">{d.support_sub}</p>
      <form action="/api/support" method="post" className="grid gap-3 bg-white/70 rounded-2xl p-6">
        {sent ? <p role="status" className="rounded-lg bg-cardamom/15 text-cardamom px-3 py-2 text-sm">{lang === "ur" ? "شکریہ! آپ کا ٹکٹ موصول ہو گیا ہے۔ ہماری ٹیم جلد آپ سے رابطہ کرے گی۔" : "Thank you! Your ticket has been received. Our team will contact you soon."}</p> : null}
        {error ? <p role="alert" className="rounded-lg bg-chili/10 text-chili px-3 py-2 text-sm">{lang === "ur" ? "براہ کرم اپنا نام اور پیغام لکھیں۔" : "Please fill in your name and message."}</p> : null}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <input name="name" placeholder={d.full_name} required className="border rounded-lg px-3 py-2" />
        <input name="phone" type="tel" placeholder={d.phone} required className="border rounded-lg px-3 py-2" />
        <input name="email" type="email" placeholder={d.email} className="border rounded-lg px-3 py-2" />
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
