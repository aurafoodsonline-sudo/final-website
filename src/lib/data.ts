import "../db/init";
import { db } from "../db";
import { categories, products, orders, orderItems, reviews, settings } from "../db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getAllProducts() {
  return db.select().from(products).where(eq(products.isHidden, 0));
}

export async function getProductBySlug(slug: string) {
  const rows = await db.select().from(products).where(eq(products.slug, slug));
  return rows[0] ?? null;
}

export async function getSetting(key: string, fallback = "") {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? fallback;
}

export function genOrderNumber() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `AF-${n}`;
}

export async function getApprovedReviews(productId: number) {
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt));
}
