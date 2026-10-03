import { getT, getContent } from "@/lib/site";
import { Lang, t } from "@/lib/constants";
import Image from "next/image";

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "ur" ? "ur" : "en") as Lang;
  const d = await getT(lang);
  const posts = await getContent("blog");
  return (
    <main className="max-w-5xl mx-auto px-4 py-14">
      <h1 data-reveal="up" className="font-heritage text-3xl md:text-4xl mb-10 text-center">{d.nav_blog}</h1>
      <div data-reveal="stagger" className="grid md:grid-cols-3 gap-6">
        {posts.map((p) => {
          const [title, excerpt] = lang === "ur" ? [p.titleUr || p.titleEn, p.bodyUr || p.bodyEn] : [p.titleEn, p.bodyEn];
          const image = p.image || "/images/logo.jpg";
          const category = (lang === "ur" ? p.extraUr || p.extraEn : p.extraEn) ?? "";
          return (
            <div key={p.id} className="group rounded-2xl bg-white/70 overflow-hidden border border-cinnamon/10 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_-22px_rgba(74,44,29,0.55)]">
              <div className="relative aspect-video overflow-hidden"><Image src={image} unoptimized={image.startsWith("/uploads/")} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.07]" /></div>
              <div className="p-4">
                <p className="text-xs text-chili mb-1">{[category, p.meta].filter(Boolean).join(" · ")}</p>
                <h3 className="font-heritage text-lg mb-1">{title}</h3>
                <p className="text-sm opacity-75">{excerpt}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
