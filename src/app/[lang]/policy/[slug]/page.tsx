import type { Metadata } from "next";
import { Lang } from "@/lib/constants";
import { notFound } from "next/navigation";
import { getPage, getSiteInfo } from "@/lib/site";
import { deliveryRuleText } from "@/lib/pricing";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = await getPage(slug);
  return page ? { title: lang === "ur" ? page.titleUr : page.titleEn } : {};
}

// Policy pages are edited in Admin → Pages. "{delivery_rule}" in the text is replaced with
// the current delivery charges from Admin → Settings.
export default async function PolicyPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const page = await getPage(slug);
  if (!page) return notFound();
  const title = lang === "ur" ? page.titleUr || page.titleEn : page.titleEn;
  const raw = lang === "ur" ? page.bodyUr || page.bodyEn : page.bodyEn;
  const body = raw.includes("{delivery_rule}") ? raw.replaceAll("{delivery_rule}", deliveryRuleText(lang, (await getSiteInfo()).delivery)) : raw;
  return (
    <main className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-heritage text-3xl mb-4">{title}</h1>
      {body.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="opacity-80 leading-relaxed mb-4 whitespace-pre-line">{para}</p>
      ))}
    </main>
  );
}
