import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Sales Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/orders/new", label: "+ Manual Order" },
  { href: "/admin/products", label: "Products / Website Stock" },
  { href: "/admin/products/new", label: "+ Add Product" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/reviews", label: "Reviews Moderation" },
  { href: "/admin/suppliers", label: "Suppliers" },
  { href: "/admin/inventory/raw-materials", label: "Raw Material & Stock" },
  { href: "/admin/inventory/processing", label: "Grinding / Processing" },
  { href: "/admin/inventory/finished-goods", label: "Finished Goods" },
  { href: "/admin/inventory/packaging", label: "Packaging" },
  { href: "/admin/inventory/traceability", label: "Stock Traceability" },
  { href: "/admin/settings", label: "WhatsApp & Payment Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-cinnamon text-cream shrink-0 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-6">
          <img src="/images/logo.jpg" alt="Aura Foods" className="w-9 h-9 rounded-full" />
          <span className="font-heritage text-lg">Aura Foods</span>
        </div>
        <nav className="space-y-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block px-3 py-2 rounded-lg hover:bg-white/10">{n.label}</Link>
          ))}
        </nav>
        <form action="/api/admin/logout" method="post" className="mt-6">
          <button className="text-xs opacity-70 hover:opacity-100">Log out</button>
        </form>
      </aside>
      <main className="flex-1 p-6 overflow-x-auto">{children}</main>
    </div>
  );
}
