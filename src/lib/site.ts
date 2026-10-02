import { cache } from "react";
import { asc, and, eq, like } from "drizzle-orm";
import { db } from "@/db";
import { settings, contentItems, pages } from "@/db/schema";
import { DICT, type Lang, type Dict } from "@/lib/constants";
import { DEFAULT_DELIVERY_RATES, parseRate, type DeliveryRates } from "@/lib/pricing";

// Everything a page needs about the business, read from Admin → Settings (database).
export type SiteInfo = {
  siteName: string; tagline: string; phone: string; whatsapp: string; whatsappUrl: string;
  email: string; city: string; address: string;
  social: { facebook: string; instagram: string; tiktok: string; youtube: string; daraz: string };
  partnerFarms: number;
  delivery: DeliveryRates;
};

const getAllSettings = cache(async () => {
  const rows = await db.select().from(settings);
  return new Map(rows.map((r) => [r.key, r.value]));
});

export const getSiteInfo = cache(async (): Promise<SiteInfo> => {
  const s = await getAllSettings();
  const get = (k: string, fallback = "") => (s.get(k) ?? fallback).trim();
  const whatsapp = get("whatsapp").replace(/\D/g, "");
  return {
    siteName: get("site_name", "Aura Foods"),
    tagline: get("tagline"),
    phone: get("phone"),
    whatsapp,
    whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}` : "",
    email: get("email"),
    city: get("city"),
    address: get("address") || get("city"),
    social: { facebook: get("facebook"), instagram: get("instagram"), tiktok: get("tiktok"), youtube: get("youtube"), daraz: get("daraz") },
    partnerFarms: parseRate(s.get("partner_farms"), 50),
    delivery: {
      deliveryCharge: parseRate(s.get("delivery_charge"), DEFAULT_DELIVERY_RATES.deliveryCharge),
      freeDeliveryFrom: parseRate(s.get("free_delivery_from"), DEFAULT_DELIVERY_RATES.freeDeliveryFrom),
    },
  };
});

// Website wording: the built-in English/Urdu text, with any changes made in
// Admin → Website Text (stored as settings "text.en.<key>" / "text.ur.<key>").
export const getT = cache(async (lang: Lang): Promise<Dict> => {
  const rows = await db.select().from(settings).where(like(settings.key, `text.${lang}.%`));
  const base = { ...DICT[lang] } as Record<string, string>;
  for (const r of rows) {
    const key = r.key.slice(`text.${lang}.`.length);
    if (key in base && key !== "dir" && r.value.trim()) base[key] = r.value;
  }
  return base as Dict;
});

export type ContentKind = "faq" | "testimonial" | "why" | "value" | "blog";

export const getContent = cache(async (kind: ContentKind) => {
  return db.select().from(contentItems)
    .where(and(eq(contentItems.kind, kind), eq(contentItems.isHidden, 0)))
    .orderBy(asc(contentItems.sortOrder), asc(contentItems.id));
});

export const getPage = cache(async (slug: string) => {
  const [row] = await db.select().from(pages).where(eq(pages.slug, slug));
  return row ?? null;
});
