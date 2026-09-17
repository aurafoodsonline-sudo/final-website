import Link from "next/link";
import Image from "next/image";
import { Lang, t, WHATSAPP_NUMBER } from "@/lib/constants";

export default function Header({ lang }: { lang: Lang }) {
  const d = t(lang);
  const other = lang === "en" ? "ur" : "en";
  const nav = [
    [`/${lang}`, d.nav_home],
    [`/${lang}/shop`, d.nav_shop],
    [`/${lang}/about`, d.nav_about],
    [`/${lang}/wholesale`, d.nav_wholesale],
    [`/${lang}/blog`, d.nav_blog],
    [`/${lang}/faq`, d.nav_faq],
    [`/${lang}/contact`, d.nav_contact],
  ];
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-cinnamon/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-2">
        <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
          <Image src="/images/logo.jpg" alt="Aura Foods" width={44} height={44} className="rounded-full" />
          <span className="font-heritage text-lg md:text-xl text-chili hidden sm:inline">Aura Foods</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-chili transition-colors">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/${lang}/track-order`} className="hidden sm:inline hover:text-chili">{d.nav_track}</Link>
          <Link href={`/${lang}/cart`} className="hover:text-chili">{d.nav_cart}</Link>
          <Link href={`/${other}`} className="rounded-full border border-chili px-3 py-1 text-chili hover:bg-chili hover:text-white transition-colors">
            {other === "ur" ? "اردو" : "EN"}
          </Link>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-4 overflow-x-auto px-4 pb-2 text-sm">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap hover:text-chili">{label}</Link>
        ))}
      </nav>
    </header>
  );
}
