import { cache } from "react";
import { cacheStorefront } from "./storefront-cache";
import { db } from "../db";
import { categories, products, bundles, bundleItems, orders, orderItems, reviews, settings } from "../db/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { DEFAULT_DELIVERY_RATES, DELIVERY_CHARGE_KEY, FREE_DELIVERY_FROM_KEY, parseRate, type DeliveryRates } from "./pricing";

export const getCategories = cache(cacheStorefront("categories", async () => {
  return db.select().from(categories).orderBy(categories.sortOrder);
}));

export const getAllProducts = cache(cacheStorefront("visible-products", async () => {
  return db.select().from(products).where(eq(products.isHidden, 0));
}));

export const getAllBundles = cache(cacheStorefront("visible-bundles", async () => {
  return db.select().from(bundles).where(eq(bundles.isHidden, 0));
}));

export const getBundleBySlug = cache(async (slug: string) => {
  const rows = await db.select().from(bundles).where(eq(bundles.slug, slug));
  return rows[0] ?? null;
});

export async function getBundleItems(bundleId: number) {
  return db.select({ item: bundleItems, product: products })
    .from(bundleItems)
    .innerJoin(products, eq(bundleItems.productId, products.id))
    .where(eq(bundleItems.bundleId, bundleId));
}

export const getProductBySlug = cache(async (slug: string) => {
  const rows = await db.select().from(products).where(eq(products.slug, slug));
  return rows[0] ?? null;
});

export async function getSetting(key: string, fallback = "") {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? fallback;
}

// Current delivery fee + free-delivery limit, as set in Admin → Settings.
export async function getDeliveryRates(): Promise<DeliveryRates> {
  const rows = await db.select().from(settings)
    .where(inArray(settings.key, [DELIVERY_CHARGE_KEY, FREE_DELIVERY_FROM_KEY]));
  const rates = new Map(rows.map(({ key, value }) => [key, value]));
  return {
    deliveryCharge: parseRate(rates.get(DELIVERY_CHARGE_KEY), DEFAULT_DELIVERY_RATES.deliveryCharge),
    freeDeliveryFrom: parseRate(rates.get(FREE_DELIVERY_FROM_KEY), DEFAULT_DELIVERY_RATES.freeDeliveryFrom),
  };
}

// Random, human-friendly order reference that is guaranteed not to exist yet.
export async function genOrderNumber() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.orderNumber, candidate));
    if (existing.length === 0) return candidate;
  }
  return `AF-${Date.now()}`;
}

export async function getApprovedReviews(productId: number) {
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt));
}
