import { Lang, t } from "@/lib/constants";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  return (
    <main className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-8 text-center">{d.checkout_title}</h1>
      <CheckoutForm lang={lang} />
    </main>
  );
}
