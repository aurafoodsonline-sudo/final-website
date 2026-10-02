import Link from "next/link";
import { like } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { DICT } from "@/lib/constants";
import { saveTexts } from "@/lib/content-actions";

// Groups make the long list of wording easier to find.
const GROUPS: [string, string[]][] = [
  ["Home page", ["hero_badge", "hero_title", "hero_sub", "hero_cta", "hero_cta2", "best_sellers", "new_arrivals", "featured", "why_title", "testimonials", "newsletter_title", "view_all", "order_whatsapp"]],
  ["About page", ["about_title", "about_sub", "about_lead", "about_h2", "about_h2_body", "stat_products", "stat_farms", "stat_promise", "our_values", "what_we_stand_for"]],
  ["Contact & support", ["contact_title", "contact_sub", "contact_lead", "reach_out", "contact_note", "chat_whatsapp", "support_title", "support_sub", "faq_badge", "faq_title", "faq_sub"]],
  ["Wholesale", ["wholesale_badge", "wholesale_title", "wholesale_cta", "wholesale_catalog", "wholesale_note"]],
  ["Menu & footer", ["nav_home", "nav_shop", "nav_about", "nav_wholesale", "nav_blog", "nav_faq", "nav_contact", "nav_track", "nav_cart", "nav_account", "footer_tagline", "footer_follow", "footer_contact", "footer_phone", "footer_email", "footer_rights"]],
];

export default async function TextsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: rawLang } = await searchParams;
  const lang = rawLang === "ur" ? "ur" : "en";
  const base = DICT[lang] as Record<string, string>;
  const rows = await db.select().from(settings).where(like(settings.key, `text.${lang}.%`));
  const custom = new Map(rows.map((r) => [r.key.slice(`text.${lang}.`.length), r.value]));
  const grouped = new Set(GROUPS.flatMap(([, keys]) => keys));
  const otherKeys = Object.keys(base).filter((k) => k !== "dir" && !grouped.has(k));
  const groups: [string, string[]][] = [...GROUPS, ["Shop, cart, checkout & other", otherKeys]];
  const label = (k: string) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="max-w-4xl">
      <h1 className="font-heritage text-2xl mb-1">Website Text</h1>
      <p className="text-sm opacity-70 mb-4">
        Headings, buttons and short sentences used across the website. Edit a box and press Save; clear a box to go back to
        the original wording. Changed boxes are marked in orange.
      </p>
      <div className="flex gap-2 mb-5 text-sm">
        <Link href="/admin/texts?lang=en" className={`px-3 py-1 rounded-full border ${lang === "en" ? "bg-chili text-white border-chili" : "bg-white"}`}>English site</Link>
        <Link href="/admin/texts?lang=ur" className={`px-3 py-1 rounded-full border ${lang === "ur" ? "bg-chili text-white border-chili" : "bg-white"}`}>اردو سائٹ</Link>
      </div>
      <form key={lang} action={saveTexts} className="space-y-4">
        <input type="hidden" name="lang" value={lang} />
        {groups.map(([title, keys]) => (
          <details key={title} open={title === "Home page"} className="bg-white rounded-xl shadow-sm">
            <summary className="cursor-pointer p-4 font-semibold">{title}</summary>
            <div className="px-4 pb-4 grid md:grid-cols-2 gap-3" dir={lang === "ur" ? "rtl" : "ltr"}>
              {keys.filter((k) => k in base).map((k) => {
                const value = custom.get(k) ?? base[k];
                const changed = custom.has(k);
                const long = base[k].length > 60;
                return (
                  <label key={k} className="text-sm">
                    <span className={changed ? "text-turmeric font-semibold" : "opacity-70"} dir="ltr">{label(k)}{changed ? " (changed)" : ""}</span>
                    {long
                      ? <textarea name={`t_${k}`} defaultValue={value} rows={3} className={`border rounded-lg px-3 py-2 w-full mt-1 ${changed ? "border-turmeric" : ""}`} />
                      : <input name={`t_${k}`} defaultValue={value} className={`border rounded-lg px-3 py-2 w-full mt-1 ${changed ? "border-turmeric" : ""}`} />}
                  </label>
                );
              })}
            </div>
          </details>
        ))}
        <button className="bg-chili text-white px-6 py-2 rounded-full sticky bottom-4 shadow-lg">Save website text</button>
      </form>
    </div>
  );
}
