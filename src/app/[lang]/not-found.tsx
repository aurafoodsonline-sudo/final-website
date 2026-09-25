"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/constants";

export default function NotFound() {
  const lang = usePathname()?.startsWith("/ur") ? "ur" : "en";
  const d = t(lang);
  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-heritage text-4xl mb-3 text-chili">404</h1>
      <p className="font-semibold mb-1">{d.not_found_title}</p>
      <p className="mb-8 opacity-80">{d.not_found_body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`/${lang}`} className="bg-chili text-white px-6 py-3 rounded-full">{d.back_home}</Link>
        <Link href={`/${lang}/shop`} className="border border-chili text-chili px-6 py-3 rounded-full">{d.browse_spices}</Link>
      </div>
    </main>
  );
}
