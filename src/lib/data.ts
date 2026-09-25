import { db } from "../db";
import { categories, products, bundles, bundleItems, orders, orderItems, reviews, settings } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getAllProducts() {
  return db.select().from(products).where(eq(products.isHidden, 0));
}

export async function getAllBundles() {
  return db.select().from(bundles).where(eq(bundles.isHidden, 0));
}

export async function getBundleBySlug(slug: string) {
  const rows = await db.select().from(bundles).where(eq(bundles.slug, slug));
  return rows[0] ?? null;
}

export async function getBundleItems(bundleId: number) {
  return db.select({ item: bundleItems, product: products })
    .from(bundleItems)
    .innerJoin(products, eq(bundleItems.productId, products.id))
    .where(eq(bundleItems.bundleId, bundleId));
}

export async function getProductBySlug(slug: string) {
  const rows = await db.select().from(products).where(eq(products.slug, slug));
  return rows[0] ?? null;
}

export async function getSetting(key: string, fallback = "") {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? fallback;
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
