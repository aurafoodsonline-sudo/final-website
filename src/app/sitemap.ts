import type { MetadataRoute } from "next";
import { getAllProducts, getAllBundles } from "@/lib/data";
import { getFooterPolicies } from "@/lib/site";
import { languages, pageUrl, webUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, bundles, policies] = await Promise.all([getAllProducts(), getAllBundles(), getFooterPolicies()]);
  const paths = [
    "", "/shop", "/about", "/wholesale", "/blog", "/faq", "/contact", "/track-order", "/support",
    ...policies.map(({ slug }) => "/policy/" + encodeURIComponent(slug)),
  ];
  const entries: MetadataRoute.Sitemap = [];
  const add = (path: string, image?: string | null, override?: string | null) => {
    const canonical = webUrl(override);
    const imageUrl = webUrl(image);
    for (const lang of ["en", "ur"] as const) {
      const url = pageUrl(lang, path);
      if (canonical && canonical !== url) continue;
      entries.push({ url, ...(!canonical ? { alternates: { languages: languages(path) } } : {}), ...(imageUrl ? { images: [imageUrl] } : {}) });
    }
  };
  paths.forEach((path) => add(path));
  products.filter((p) => !p.noIndex).forEach((p) => add("/product/" + encodeURIComponent(p.slug), p.image, p.canonicalUrl));
  bundles.forEach((b) => add("/bundle/" + encodeURIComponent(b.slug), b.image));
  return entries;
}
