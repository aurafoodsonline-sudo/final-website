import path from "node:path";
import bcrypt from "bcryptjs";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  categories, products, suppliers, rawMaterials, adminUsers, settings, contentItems, pages,
} from "./schema";
import {
  SEED_CATEGORIES, SEED_PRODUCTS, SEED_SUPPLIERS, SEED_RAW_MATERIALS, SEED_SETTINGS,
  SEED_WHY, SEED_TESTIMONIALS, SEED_VALUES, SEED_BLOG_POSTS, SEED_FAQS, SEED_PAGES,
} from "./seed-data";

// Creates/updates every table (SQL files in /drizzle) and fills an empty database with the
// starter catalog and content. Safe to run on every start: nothing that already exists is
// overwritten, and content the admin deleted is not brought back.
export async function setupDatabase() {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await seedIfNeeded();
}

async function flag(key: string) {
  const rows = await db.select().from(settings).where(sql`${settings.key} = ${key}`);
  return rows.length > 0;
}
async function setFlag(key: string) {
  await db.insert(settings).values({ key, value: new Date().toISOString() }).onConflictDoNothing();
}

export async function seedIfNeeded() {
  // Settings: add any missing keys with their default value, never overwrite.
  for (const [key, value] of SEED_SETTINGS) {
    await db.insert(settings).values({ key, value }).onConflictDoNothing();
  }

  // Admin account: only when there is none. Password from ADMIN_PASSWORD if set.
  const admins = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (admins.length === 0) {
    const password = process.env.ADMIN_PASSWORD || "AuraAdmin@2026";
    await db.insert(adminUsers).values({ username: process.env.ADMIN_USERNAME || "admin", passwordHash: await bcrypt.hash(password, 10), name: "Aura Foods Admin" });
    console.log("[setup] Created the admin account. Change its password in Admin → Settings.");
  }

  if (!(await flag("seeded_catalog_v1"))) {
    const existing = await db.select({ id: categories.id }).from(categories).limit(1);
    if (existing.length === 0) {
      const catIds: Record<string, number> = {};
      for (let i = 0; i < SEED_CATEGORIES.length; i++) {
        const [slug, en, ur] = SEED_CATEGORIES[i];
        const [row] = await db.insert(categories).values({ slug, nameEn: en, nameUr: ur, sortOrder: i, image: `/images/category_${i + 1}.jpg` }).returning();
        catIds[en] = row.id;
      }
      for (const p of SEED_PRODUCTS) {
        await db.insert(products).values({
          slug: p.slug, sku: p.sku, categoryId: catIds[p.cat],
          nameEn: p.nameEn, nameUr: p.nameUr, taglineEn: p.taglineEn, taglineUr: p.taglineUr,
          descriptionEn: p.descriptionEn, descriptionUr: p.descriptionUr,
          ingredientsEn: p.ingredientsEn, ingredientsUr: p.ingredientsUr, usageEn: p.usageEn, usageUr: p.usageUr,
          weightLabel: p.weightLabel, price: p.price, image: p.image,
          bestSeller: p.bestSeller, newArrival: p.newArrival, featured: p.featured,
          wholesaleEligible: 1, wholesalePrice: p.wholesalePrice, websiteStockStatus: "available", internalStockQty: 0,
          metaTitleEn: `${p.nameEn} | Aura Foods`, metaTitleUr: `${p.nameUr} | آورا فوڈز`,
          metaDescriptionEn: p.taglineEn, metaDescriptionUr: p.taglineUr, imageAltEn: p.nameEn, imageAltUr: p.nameUr,
        });
      }
      for (const s of SEED_SUPPLIERS) await db.insert(suppliers).values(s);
      for (const name of SEED_RAW_MATERIALS) await db.insert(rawMaterials).values({ name, unit: "kg", stockQty: 0 }).onConflictDoNothing();
      console.log("[setup] Added the starter product catalog.");
    }
    await setFlag("seeded_catalog_v1");
  }

  if (!(await flag("seeded_content_v1"))) {
    const existing = await db.select({ id: contentItems.id }).from(contentItems).limit(1);
    if (existing.length === 0) {
      const rows: (typeof contentItems.$inferInsert)[] = [];
      SEED_FAQS.forEach((f, i) => rows.push({ kind: "faq", sortOrder: i, titleEn: f.en[0], bodyEn: f.en[1], titleUr: f.ur[0], bodyUr: f.ur[1] }));
      SEED_WHY.forEach((f, i) => rows.push({ kind: "why", sortOrder: i, titleEn: f.en[0], bodyEn: f.en[1], titleUr: f.ur[0], bodyUr: f.ur[1] }));
      SEED_VALUES.forEach((f, i) => rows.push({ kind: "value", sortOrder: i, titleEn: f.en[0], bodyEn: f.en[1], titleUr: f.ur[0], bodyUr: f.ur[1] }));
      SEED_TESTIMONIALS.forEach((f, i) => rows.push({ kind: "testimonial", sortOrder: i, titleEn: f.en[0], extraEn: f.en[1], bodyEn: f.en[2], titleUr: f.ur[0], extraUr: f.ur[1], bodyUr: f.ur[2] }));
      SEED_BLOG_POSTS.forEach((p, i) => rows.push({ kind: "blog", sortOrder: i, titleEn: p.en[0], bodyEn: p.en[1], titleUr: p.ur[0], bodyUr: p.ur[1], extraEn: p.category, extraUr: p.category, meta: p.read, image: `/images/blog-${p.slug}.jpg` }));
      await db.insert(contentItems).values(rows);
    }
    for (const [slug, p] of Object.entries(SEED_PAGES)) {
      await db.insert(pages).values({ slug, titleEn: p.en[0], bodyEn: p.en[1], titleUr: p.ur[0], bodyUr: p.ur[1] }).onConflictDoNothing();
    }
    await setFlag("seeded_content_v1");
    console.log("[setup] Added the starter website content (FAQ, testimonials, blog, policies).");
  }
}
