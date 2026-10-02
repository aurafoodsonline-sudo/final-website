import Link from "next/link";
import Image from "next/image";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube, FaBagShopping } from "react-icons/fa6";
import { getT, getSiteInfo, getPage } from "@/lib/site";
import { Lang } from "@/lib/constants";

const POLICY_SLUGS = ["privacy-policy", "return-policy", "shipping-policy", "terms"];

export default async function Footer({ lang }: { lang: Lang }) {
  const d = await getT(lang);
  const site = await getSiteInfo();
  const ur = lang === "ur";
  const policies = (await Promise.all(POLICY_SLUGS.map((slug) => getPage(slug)))).filter((p) => p !== null);

  // Social links come from Admin → Settings; an empty link hides its icon.
  const socials: { href: string; label: string; Icon: IconType }[] = [
    { href: site.social.facebook, label: "Facebook", Icon: FaFacebookF },
    { href: site.social.instagram, label: "Instagram", Icon: FaInstagram },
    { href: site.social.tiktok, label: "TikTok", Icon: FaTiktok },
    { href: site.whatsappUrl, label: "WhatsApp", Icon: FaWhatsapp },
    { href: site.social.youtube, label: "YouTube", Icon: FaYoutube },
    { href: site.social.daraz, label: "Daraz", Icon: FaBagShopping },
  ].filter((s) => s.href);

  return (
    <footer dir={ur ? "rtl" : "ltr"} className="bg-cinnamon text-cream mt-16">
      <div data-reveal="stagger" className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 items-start">
        <div className={`min-w-0 col-span-2 md:col-span-1 ${ur ? "text-right" : "text-left"}`}>
          <div className={`flex items-center gap-2 mb-2 ${ur ? "justify-end" : "justify-start"}`}>
            <Image src="/images/logo.jpg" alt={site.siteName} width={40} height={40} className="rounded-full" />
            <span className="font-heritage text-lg">{site.siteName}</span>
          </div>
          <p className="text-sm opacity-80">{d.footer_tagline}</p>
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold mb-2">{d.nav_shop}</h4>
          <ul className="text-sm space-y-1 opacity-90">
            <li><Link href={`/${lang}/shop`}>{d.nav_shop}</Link></li>
            <li><Link href={`/${lang}/wholesale`}>{d.nav_wholesale}</Link></li>
            <li><Link href={`/${lang}/about`}>{d.nav_about}</Link></li>
            <li><Link href={`/${lang}/faq`}>{d.nav_faq}</Link></li>
            <li><Link href={`/${lang}/track-order`}>{d.nav_track}</Link></li>
            <li><Link href={`/${lang}/support`}>{d.support_title}</Link></li>
          </ul>
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold mb-2">{d.footer_contact}</h4>
          <ul className="text-sm space-y-1 opacity-90 break-words">
            {site.phone ? <li>{d.footer_phone}: <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} dir="ltr">{site.phone}</a></li> : null}
            {site.email ? <li>{d.footer_email}: <a href={`mailto:${site.email}`}>{site.email}</a></li> : null}
            {site.address ? <li>{d.address}: {site.address}</li> : null}
          </ul>
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold mb-3">{d.footer_follow}</h4>
          <ul className="flex flex-wrap gap-2.5">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid place-items-center w-10 h-10 rounded-full bg-cream/10 text-cream ring-1 ring-cream/20 transition-[background-color,color,transform] duration-300 hover:bg-turmeric hover:text-cinnamon hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-turmeric"
                >
                  <Icon aria-hidden="true" className="w-[18px] h-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs opacity-80">
        {policies.map((p) => (
          <Link key={p.slug} href={`/${lang}/policy/${p.slug}`}>{ur ? p.titleUr : p.titleEn}</Link>
        ))}
      </div>
      <div className="text-center text-xs opacity-70 py-4 border-t border-cream/10">
        © {new Date().getFullYear()} {site.siteName}. {d.footer_rights}
      </div>
    </footer>
  );
}
