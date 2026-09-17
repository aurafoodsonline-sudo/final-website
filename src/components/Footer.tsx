import Link from "next/link";
import Image from "next/image";
import { Lang, t, SOCIAL_LINKS, PHONE_DISPLAY, BUSINESS_EMAIL } from "@/lib/constants";

export default function Footer({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer className="bg-cinnamon text-cream mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/images/logo.jpg" alt="Aura Foods" width={40} height={40} className="rounded-full" />
            <span className="font-heritage text-lg">Aura Foods</span>
          </div>
          <p className="text-sm opacity-80">{d.footer_tagline}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{d.nav_shop}</h4>
          <ul className="text-sm space-y-1 opacity-90">
            <li><Link href={`/${lang}/shop`}>{d.nav_shop}</Link></li>
            <li><Link href={`/${lang}/wholesale`}>{d.nav_wholesale}</Link></li>
            <li><Link href={`/${lang}/about`}>{d.nav_about}</Link></li>
            <li><Link href={`/${lang}/faq`}>{d.nav_faq}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{d.footer_contact}</h4>
          <ul className="text-sm space-y-1 opacity-90">
            <li>{d.footer_phone}: {PHONE_DISPLAY}</li>
            <li>{d.footer_email}: {BUSINESS_EMAIL}</li>
            <li><a href={SOCIAL_LINKS.whatsapp} className="underline">{d.order_whatsapp}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{d.footer_follow}</h4>
          <div className="flex gap-3 text-sm opacity-90">
            <a href={SOCIAL_LINKS.facebook}>Facebook</a>
            <a href={SOCIAL_LINKS.instagram}>Instagram</a>
            <a href={SOCIAL_LINKS.tiktok}>TikTok</a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs opacity-70 py-4 border-t border-cream/10">
        © {new Date().getFullYear()} Aura Foods. {d.footer_rights}
      </div>
    </footer>
  );
}
