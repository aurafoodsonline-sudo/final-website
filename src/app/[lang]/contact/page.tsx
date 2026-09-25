import { Lang, t, PHONE_DISPLAY, BUSINESS_EMAIL, BUSINESS_CITY, SOCIAL_LINKS } from "@/lib/constants";

export default async function ContactPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { lang: rawLang } = await params;
  const { sent } = await searchParams;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10">
      <div>
        <p className="text-xs uppercase tracking-wide text-chili mb-2">{d.contact_title}</p>
        <h1 className="font-heritage text-3xl mb-3">{d.contact_sub}</h1>
        <p className="opacity-80 mb-6">{d.contact_lead}</p>
        <h2 className="font-semibold mb-2">{d.reach_out}</h2>
        <p className="text-sm opacity-70 mb-4">{d.contact_note}</p>
        <ul className="text-sm space-y-2">
          <li>{d.phone}: {PHONE_DISPLAY}</li>
          <li>{d.email}: {BUSINESS_EMAIL}</li>
          <li>{d.address}: {BUSINESS_CITY}, Pakistan</li>
        </ul>
        <a href={SOCIAL_LINKS.whatsapp} className="inline-block mt-5 bg-cardamom text-white px-5 py-2 rounded-full">{d.chat_whatsapp}</a>
      </div>
      <form action="/api/contact" method="post" className="grid gap-3 self-start bg-white/70 rounded-2xl p-6">
        {sent ? <p role="status" className="rounded-lg bg-cardamom/15 text-cardamom px-3 py-2 text-sm">{lang === "ur" ? "شکریہ! آپ کا پیغام موصول ہو گیا ہے۔ ہم عام طور پر 24 گھنٹوں میں جواب دیتے ہیں۔" : "Thank you! Your message has been received. We usually reply within 24 hours."}</p> : null}
        <input name="name" placeholder={d.full_name} required className="border rounded-lg px-3 py-2" />
        <input name="email" type="email" placeholder={d.email} required className="border rounded-lg px-3 py-2" />
        <input name="phone" placeholder={d.phone} className="border rounded-lg px-3 py-2" />
        <textarea name="message" placeholder={d.message} required className="border rounded-lg px-3 py-2" rows={4} />
        <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">{d.send_message}</button>
      </form>
    </main>
  );
}
