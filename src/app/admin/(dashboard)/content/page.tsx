import Link from "next/link";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { saveContentItem, deleteContentItem } from "@/lib/content-actions";
import { listSelectableImages } from "@/lib/uploads";
import AdminImagePicker from "@/components/AdminImagePicker";

type Kind = "faq" | "testimonial" | "why" | "value" | "blog";
type KindConfig = {
  tab: string; where: string; title: string; body: string; extra?: string; meta?: string; image?: boolean; longBody?: boolean;
};

const KINDS: Record<Kind, KindConfig> = {
  faq: { tab: "FAQ", where: "FAQ page", title: "Question", body: "Answer", longBody: true },
  testimonial: { tab: "Testimonials", where: "Home page, \"What Our Customers Say\"", title: "Customer name", body: "What they said", extra: "City" },
  why: { tab: "Why Aura Foods", where: "Home page, \"Why Aura Foods\" cards", title: "Heading", body: "Short text" },
  value: { tab: "Our Values", where: "About page, \"What We Stand For\"", title: "Heading", body: "Short text" },
  blog: { tab: "Blog", where: "Blog page", title: "Post title", body: "Short summary", extra: "Category", meta: "Read time (e.g. 5 min)", image: true, longBody: true },
};

const input = "border rounded-lg px-3 py-2 w-full mt-1";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind: rawKind } = await searchParams;
  const kind = (rawKind && rawKind in KINDS ? rawKind : "faq") as Kind;
  const cfg = KINDS[kind];
  const items = await db.select().from(contentItems).where(and(eq(contentItems.kind, kind))).orderBy(asc(contentItems.sortOrder), asc(contentItems.id));
  const images = cfg.image
    ? [...items.map((i) => i.image).filter((i): i is string => !!i), ...(await listSelectableImages())].filter((v, i, a) => a.indexOf(v) === i)
    : [];
  const nextOrder = items.length ? Math.max(...items.map((i) => i.sortOrder)) + 1 : 0;

  const fields = (item?: (typeof items)[number]) => (
    <>
      <input type="hidden" name="kind" value={kind} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">{cfg.title} (English)<input name="titleEn" required defaultValue={item?.titleEn} className={input} /></label>
        <label className="text-sm" dir="rtl">{cfg.title} (اردو)<input name="titleUr" defaultValue={item?.titleUr} className={input} /></label>
        <label className="text-sm">{cfg.body} (English)<textarea name="bodyEn" required rows={cfg.longBody ? 4 : 2} defaultValue={item?.bodyEn} className={input} /></label>
        <label className="text-sm" dir="rtl">{cfg.body} (اردو)<textarea name="bodyUr" rows={cfg.longBody ? 4 : 2} defaultValue={item?.bodyUr} className={input} /></label>
        {cfg.extra ? (
          <>
            <label className="text-sm">{cfg.extra} (English)<input name="extraEn" defaultValue={item?.extraEn ?? ""} className={input} /></label>
            <label className="text-sm" dir="rtl">{cfg.extra} (اردو)<input name="extraUr" defaultValue={item?.extraUr ?? ""} className={input} /></label>
          </>
        ) : null}
        {cfg.meta ? <label className="text-sm">{cfg.meta}<input name="meta" defaultValue={item?.meta ?? ""} className={input} /></label> : null}
        {cfg.image ? <AdminImagePicker images={images} defaultValue={item?.image} label="Picture" /> : null}
        <label className="text-sm">Position (lower numbers show first)<input name="sortOrder" type="number" step={1} defaultValue={item?.sortOrder ?? nextOrder} className={input} /></label>
        <label className="text-sm flex items-center gap-2 mt-6"><input type="checkbox" name="isHidden" defaultChecked={!!item?.isHidden} /> Hide from the website</label>
      </div>
    </>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="font-heritage text-2xl mb-1">Website Content</h1>
      <p className="text-sm opacity-70 mb-4">
        Changes appear on the website immediately. Leave the Urdu boxes empty to show the English text on the Urdu site.
        {kind === "faq" ? <> Type <code className="bg-cream px-1 rounded">{"{delivery_rule}"}</code> to insert the current delivery charges.</> : null}
      </p>
      <div className="flex flex-wrap gap-2 mb-5 text-sm">
        {(Object.keys(KINDS) as Kind[]).map((k) => (
          <Link key={k} href={`/admin/content?kind=${k}`} className={`px-3 py-1 rounded-full border ${k === kind ? "bg-chili text-white border-chili" : "bg-white"}`}>{KINDS[k].tab}</Link>
        ))}
      </div>
      <p className="text-xs uppercase tracking-wide opacity-60 mb-2">Shown on: {cfg.where}</p>

      <div className="space-y-3 mb-8">
        {items.length === 0 ? <p className="text-sm opacity-60 bg-white rounded-xl p-6">Nothing here yet — add the first one below.</p> : null}
        {items.map((item) => (
          <details key={item.id} className="bg-white rounded-xl shadow-sm group">
            <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="font-medium">{item.titleEn}</span>
                {item.isHidden ? <span className="ml-2 text-xs bg-cinnamon/10 px-2 py-0.5 rounded-full">Hidden</span> : null}
                <span className="block text-xs opacity-60 truncate">{item.bodyEn}</span>
              </span>
              <span className="text-xs text-chili shrink-0 group-open:hidden">Edit</span>
            </summary>
            <div className="px-4 pb-4 border-t pt-4">
              <form action={saveContentItem} className="grid gap-3">
                {fields(item)}
                <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Save</button>
              </form>
              <form action={deleteContentItem} className="mt-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="kind" value={kind} />
                <button className="text-chili text-sm hover:underline">Delete this item</button>
              </form>
            </div>
          </details>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold mb-3">Add new — {cfg.tab}</h2>
        <form action={saveContentItem} className="grid gap-3">
          {fields()}
          <button className="bg-chili text-white px-5 py-2 rounded-full w-fit">Add</button>
        </form>
      </div>
    </div>
  );
}
