import type { Metadata } from "next";
import "lenis/dist/lenis.css";
// Handwritten font for the spice ribbon, bundled with the site (no Google Fonts dependency).
import "@fontsource/dancing-script/700.css";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollProgress from "@/components/motion/ScrollProgress";
import RevealManager from "@/components/motion/RevealManager";
import MotionProviders from "@/components/motion/MotionProviders";

// Hides [data-reveal] elements before first paint so they can animate in. It only applies
// when the visitor allows motion, and un-hides everything if the animation code hasn't
// started after 4 seconds (slow network, script blocked), so content is never lost.
const MOTION_BOOT = `(function(){try{var d=document.documentElement;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-ok');setTimeout(function(){if(!window.__auraReveal)d.classList.remove('motion-ok')},4000)}}catch(e){}})();`;
import { Lang } from "@/lib/constants";
import { SITE_URL } from "@/lib/constants";
import { getT, getSiteInfo } from "@/lib/site";
import SiteProvider from "@/components/SiteProvider";

// Loaded via a plain <link> below (not next/font) so the build never depends on reaching
// fonts.googleapis.com — falls back cleanly to the system stacks in globals.css if the
// deployment environment has no outbound internet access to Google Fonts.

// Every page reads products, prices and text from the database, so pages are rendered on
// each visit (no copies baked in at build time, and the build needs no database).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isUr = lang === "ur";
  return {
    metadataBase: new URL(SITE_URL),
    title: isUr ? "آورا فوڈز — خالص • معیاری • خوشبودار" : "Aura Foods — Crafted for Pure Taste",
    description: isUr
      ? "پاکستان بھر میں ڈیلیوری کے ساتھ خالص اور پریمیم آرگینک مصالحے۔"
      : "Pure & Premium Organic Spices, delivered across Pakistan and beyond.",
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: { en: `${SITE_URL}/en`, ur: `${SITE_URL}/ur` },
    },
    openGraph: {
      url: SITE_URL,
      type: "website",
      title: isUr ? "آورا فوڈز — خالص • معیاری • خوشبودار" : "Aura Foods — Crafted for Pure Taste",
      siteName: "Aura Foods",
    },
    verification: process.env.FACEBOOK_DOMAIN_VERIFICATION
      ? { other: { "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION } }
      : undefined,
    icons: { icon: "/images/favicon.jpg" },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = (lang === "ur" ? "ur" : "en") as Lang;
  const dict = await getT(l);
  const site = await getSiteInfo();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.siteName,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.jpg`,
    sameAs: [site.social.facebook, site.social.instagram, site.social.tiktok, site.social.youtube, site.social.daraz].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.phone,
      email: site.email,
      contactType: "customer service",
      areaServed: site.city,
      availableLanguage: ["English", "Urdu"],
    },
  };

  return (
    <html lang={l} dir={dict.dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=Noto+Nastaliq+Urdu:wght@600;700&family=Noto+Naskh+Arabic:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');fbq('track','PageView');`,
            }}
          />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SiteProvider value={{ lang: l, dict, site }}>
        <MotionProviders>
          <SmoothScroll />
          <ScrollProgress />
          <RevealManager />
          <Header lang={l} />
          {children}
          <Footer lang={l} />
        </MotionProviders>
        </SiteProvider>
      </body>
    </html>
  );
}
