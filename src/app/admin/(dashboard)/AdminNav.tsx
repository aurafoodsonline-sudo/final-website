"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  { title: "Daily", links: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/orders/new", label: "+ New Manual Order" },
    { href: "/admin/reviews", label: "Reviews" },
  ] },
  { title: "Website Catalog", links: [
    { href: "/admin/products", label: "Products & Stock" },
    { href: "/admin/products/new", label: "+ Add Product" },
    { href: "/admin/bundles", label: "Bundles" },
    { href: "/admin/categories", label: "Categories" },
  ] },
  { title: "Inventory & Production", links: [
    { href: "/admin/suppliers", label: "Suppliers" },
    { href: "/admin/inventory/raw-materials", label: "1. Raw Material Purchases" },
    { href: "/admin/inventory/processing", label: "2. Grinding / Processing" },
    { href: "/admin/inventory/finished-goods", label: "3. Finished Goods" },
    { href: "/admin/inventory/packaging", label: "4. Packaging" },
    { href: "/admin/inventory/traceability", label: "Batch Traceability" },
  ] },
  { title: "Setup", links: [
    { href: "/admin/settings", label: "Settings" },
  ] },
];

const ALL_HREFS = GROUPS.flatMap((g) => g.links.map((l) => l.href));

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (pathname === href) return true;
  // Highlight the closest parent only if no more specific link matches.
  return pathname.startsWith(`${href}/`) && !ALL_HREFS.some((h) => h !== href && h.startsWith(href) && pathname.startsWith(h));
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-4 text-sm">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 mb-1 text-[11px] uppercase tracking-wider opacity-60">{group.title}</p>
          {group.links.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                className={`block px-3 py-2 rounded-lg ${active ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}>
                {n.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-sm">
      <a href="/en" target="_blank" rel="noreferrer" className="block px-3 py-2 rounded-lg hover:bg-white/10">View website ↗</a>
      <form action="/api/admin/logout" method="post">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10">Log out</button>
      </form>
    </div>
  );
}

export default function AdminNav() {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-cinnamon text-cream px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/images/logo.jpg" alt="" className="w-8 h-8 rounded-full" />
          <span className="font-heritage">Aura Foods Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="rounded-lg border border-cream/40 px-3 py-1.5 text-sm">
          {open ? "Close ✕" : "Menu ☰"}
        </button>
      </div>
      {open && (
        <div className="md:hidden fixed inset-x-0 top-[56px] bottom-0 z-40 overflow-y-auto bg-cinnamon text-cream p-4">
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <Footer />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 bg-cinnamon text-cream shrink-0 p-4 hidden md:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-2 mb-6">
            <img src="/images/logo.jpg" alt="" className="w-9 h-9 rounded-full" />
            <span className="font-heritage text-lg">Aura Foods</span>
          </Link>
          <NavLinks pathname={pathname} />
          <Footer />
        </div>
      </aside>
    </>
  );
}
