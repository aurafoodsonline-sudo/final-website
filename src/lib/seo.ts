import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, type Lang } from "@/lib/constants";

export const pageUrl = (lang: Lang, path: string) => SITE_URL + "/" + lang + path;
export const languages = (path: string) => ({ en: pageUrl("en", path), ur: pageUrl("ur", path), "x-default": pageUrl("en", path) });

export function webUrl(value?: string | null) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, SITE_URL);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    return undefined;
  }
}

export function pageMetadata(lang: Lang, path: string, options: {
  title: string; description?: string; image?: string | null; canonical?: string | null; noIndex?: boolean;
}): Metadata {
  const { title, description, noIndex } = options;
  const canonical = webUrl(options.canonical);
  const url = canonical ?? pageUrl(lang, path);
  const images = [webUrl(options.image) ?? SITE_URL + "/images/logo.jpg"];
  const socialTitle = title + " | " + SITE_NAME;
  return {
    title, description,
    alternates: { canonical: url, ...(!canonical && !noIndex ? { languages: languages(path) } : {}) },
    openGraph: { type: "website", siteName: SITE_NAME, locale: lang === "ur" ? "ur_PK" : "en_PK", url, title: socialTitle, description, images },
    twitter: { card: "summary_large_image", title: socialTitle, description, images },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function structuredData(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbs(lang: Lang, ...items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [{name: SITE_NAME, path: ""}, ...items].map(({ name, path }, index) => ({
      "@type": "ListItem", position: index + 1, name, item: pageUrl(lang, path),
    })),
  };
}
