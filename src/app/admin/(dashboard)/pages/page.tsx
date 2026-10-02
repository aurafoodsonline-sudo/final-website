import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { savePage } from "@/lib/content-actions";

const input = "border rounded-lg px-3 py-2 w-full mt-1";

export default async function PagesAdmin({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const { slug } = await searchParams;
  const all = await db.select().from(pages).orderBy(asc(pages.slug));
  const page = all.find((p) => p.slug === slug) ?? all[0];

  return (
    <div className="max-w-4xl">
      <h1 className="font-heritage text-2xl mb-1">Policy Pages</h1>
      <p className="text-sm opacity-70 mb-4">
        These pages are linked at the bottom of every page. Leave a blank line between paragraphs. Type{" "}
        <code className="bg-cream px-1 rounded">{"{delivery_rule}"}</code> to insert the current delivery charges.
      </p>
      <div className="flex flex-wrap gap-2 mb-5 text-sm">
        {all.map((p) => (
          <Link key={p.slug} href={`/admin/pages?slug=${p.slug}`} className={`px-3 py-1 rounded-full border ${p.slug === page?.slug ? "bg-chili text-white border-chili" : "bg-white"}`}>{p.titleEn}</Link>
        ))}
      </div>
      {page ? (
        <form key={page.slug} action={savePage} className="bg-white rounded-xl p-5 shadow-sm grid md:grid-cols-2 gap-3">
          <input type="hidden" name="slug" value={page.slug} />
          <label className="text-sm">Title (English)<input name="titleEn" required defaultValue={page.titleEn} className={input} /></label>
          <label className="text-sm" dir="rtl">عنوان (اردو)<input name="titleUr" defaultValue={page.titleUr} className={input} /></label>
          <label className="text-sm">Text (English)<textarea name="bodyEn" required rows={14} defaultValue={page.bodyEn} className={input} /></label>
          <label className="text-sm" dir="rtl">متن (اردو)<textarea name="bodyUr" rows={14} defaultValue={page.bodyUr} className={input} /></label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-4">
            <button className="bg-chili text-white px-5 py-2 rounded-full">Save page</button>
            <a href={`/en/policy/${page.slug}`} target="_blank" className="text-sm underline">View on website</a>
          </div>
        </form>
      ) : <p className="text-sm opacity-60">No pages yet. They are created automatically when the site starts.</p>}
    </div>
  );
}
