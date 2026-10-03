import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllProducts, getAllBundles } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await getAllProducts()).filter((p) => !p.noIndex);
  const bundles = await getAllBundles();
  const staticPaths = ["", "/shop", "/about", "/wholesale", "/blog", "/faq", "/contact", "/track-order", "/support", "/policy/privacy-policy", "/policy/return-policy", "/policy/shipping-policy", "/policy/terms"];
  const langs = ["en", "ur"];
  const entries: MetadataRoute.Sitemap = [];
  for (const lang of langs) {
    for (const p of staticPaths) {
      entries.push({ url: `${SITE_URL}/${lang}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 });
    }
    for (const p of products) {
      entries.push({ url: `${SITE_URL}/${lang}/product/${p.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const b of bundles) {
      entries.push({ url: `${SITE_URL}/${lang}/bundle/${b.slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }
  return entries;
}
