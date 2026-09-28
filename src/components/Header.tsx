"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Lang, t } from "@/lib/constants";
import { getCart } from "@/lib/cart";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export default function Header({ lang }: { lang: Lang }) {
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const d = t(lang);
  const other = lang === "en" ? "ur" : "en";
  const pathname = usePathname() ?? `/${lang}`;
  // Switch language but stay on the same page (e.g. /en/shop -> /ur/shop).
  const switchHref = pathname.replace(/^\/(en|ur)(?=\/|$)/, `/${other}`) || `/${other}`;
  const isActive = (href: string) => (href === `/${lang}` ? pathname === href : pathname.startsWith(href));
  const nav = [
    [`/${lang}`, d.nav_home],
    [`/${lang}/shop`, d.nav_shop],
    [`/${lang}/about`, d.nav_about],
    [`/${lang}/wholesale`, d.nav_wholesale],
    [`/${lang}/blog`, d.nav_blog],
    [`/${lang}/faq`, d.nav_faq],
    [`/${lang}/contact`, d.nav_contact],
  ];

  useEffect(() => {
    const readCount = () => getCart().reduce((total, item) => total + item.qty, 0);
    setCartCount(readCount());
    const onCartUpdated = () => {
      setCartCount(readCount());
      // Little "pop" on the cart badge whenever something is added.
      if (badgeRef.current && !prefersReducedMotion()) {
        gsap.fromTo(badgeRef.current, { scale: 1.8, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
      }
    };
    window.addEventListener("cart-updated", onCartUpdated);
    return () => window.removeEventListener("cart-updated", onCartUpdated);
  }, []);

  // Header tucks away while scrolling down and slides back on the way up.
  useGSAP(() => {
    const el = headerRef.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const show = gsap.quickTo(el, "yPercent", { duration: 0.45, ease: "power3.out" });
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        setScrolled(y > 12);
        if (reduce) return;
        show(self.direction === 1 && y > 240 ? -100 : 0);
      },
    });
    return () => st.kill();
  }, { scope: headerRef });

  // Always show the header again on a new page.
  useEffect(() => {
    if (headerRef.current) gsap.set(headerRef.current, { yPercent: 0 });
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,box-shadow,border-color] duration-500 ${scrolled ? "bg-cream/85 border-cinnamon/10 shadow-[0_10px_30px_-18px_rgba(74,44,29,0.45)]" : "bg-cream/95 border-transparent"}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-2">
        <Link href={`/${lang}`} className="group flex items-center gap-2 shrink-0">
          <Image src="/images/logo.jpg" alt="Aura Foods" width={44} height={44} className="rounded-full transition-transform duration-700 ease-out group-hover:rotate-[360deg]" />
          <span className="font-heritage text-lg md:text-xl text-chili hidden sm:inline">Aura Foods</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={`nav-link hover:text-chili transition-colors ${isActive(href) ? "text-chili is-active" : ""}`}>{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/${lang}/track-order`} className="hidden sm:inline hover:text-chili">{d.nav_track}</Link>
          <Link href={`/${lang}/cart`} className="hover:text-chili inline-flex items-center gap-1" aria-label={`${d.nav_cart} (${cartCount})`}>
            <span aria-hidden="true">🛒</span>
            <span>{d.nav_cart}</span>
            <span ref={badgeRef} className="min-w-5 h-5 px-1 rounded-full bg-chili text-white text-xs inline-flex items-center justify-center">{cartCount}</span>
          </Link>
          <Link href={switchHref} className="rounded-full border border-chili px-3 py-1 text-chili hover:bg-chili hover:text-white transition-colors">
            {other === "ur" ? "اردو" : "EN"}
          </Link>
        </div>
      </div>
      <nav className="md:hidden flex flex-wrap justify-center gap-x-4 gap-y-2 px-4 pb-2 text-sm">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={`hover:text-chili ${isActive(href) ? "text-chili font-medium" : ""}`}>{label}</Link>
        ))}
        <Link href={`/${lang}/track-order`} className="sm:hidden hover:text-chili">{d.nav_track}</Link>
      </nav>
    </header>
  );
}
