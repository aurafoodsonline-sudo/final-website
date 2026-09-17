import { Lang, t, SOCIAL_LINKS } from "@/lib/constants";
import { getAllProducts } from "@/lib/data";
import Image from "next/image";

export default async function WholesalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = t(lang);
  const products = (await getAllProducts()).filter((p) => p.wholesaleEligible);
  return (
    <main className="max-w-6xl mx-auto px-4 py-14">
      <p className="text-xs uppercase tracking-wide text-chili mb-2 text-center">{d.wholesale_badge}</p>
      <h1 className="font-heritage text-3xl mb-3 text-center">{d.wholesale_title}</h1>
      <div className="text-center mb-10">
        <a href={SOCIAL_LINKS.whatsapp} className="inline-block bg-cardamom text-white px-6 py-3 rounded-full font-medium">{d.wholesale_cta}</a>
      </div>
      <h2 className="font-heritage text-2xl mb-2">{d.wholesale_catalog}</h2>
      <p className="opacity-70 text-sm mb-6">{d.wholesale_note}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white/70 border border-cinnamon/10 overflow-hidden">
            <div className="relative aspect-square"><Image src={p.image ?? "/images/logo.jpg"} alt={lang === "ur" ? p.nameUr : p.nameEn} fill className="object-cover" /></div>
            <div className="p-4">
              <h3 className="font-heritage text-base">{lang === "ur" ? p.nameUr : p.nameEn}</h3>
              <p className="text-sm opacity-70">1kg — Rs. {p.wholesalePrice ?? "—"}</p>
              <button className="mt-2 text-sm bg-chili text-white px-4 py-1.5 rounded-full">{d.add_to_cart}</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
