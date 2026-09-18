"use server";
import { db } from "@/db";
import { categories, suppliers, rawMaterials, rawMaterialPurchases, processingRecords, finishedGoodsBatches, packagingRecords, products, reviews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export async function createSupplier(formData: FormData) {
  await db.insert(suppliers).values({
    name: String(formData.get("name")),
    contact: String(formData.get("contact") ?? ""),
    address: String(formData.get("address") ?? ""),
    suppliedMaterials: String(formData.get("suppliedMaterials") ?? ""),
    paymentType: String(formData.get("paymentType") ?? "cash"),
    notes: String(formData.get("notes") ?? ""),
  });
  revalidatePath("/admin/suppliers");
}

export async function createRawMaterialPurchase(formData: FormData) {
  const rawMaterialId = Number(formData.get("rawMaterialId"));
  const quantity = Number(formData.get("quantity"));
  const purchaseRate = Number(formData.get("purchaseRate"));
  const totalCost = quantity * purchaseRate;
  const paidAmount = Number(formData.get("paidAmount")) || 0;
  const remainingAmount = totalCost - paidAmount;

  await db.insert(rawMaterialPurchases).values({
    supplierId: Number(formData.get("supplierId")),
    rawMaterialId, purchaseDate: String(formData.get("purchaseDate")),
    quantity, unit: String(formData.get("unit") ?? "kg"), purchaseRate, totalCost,
    paymentType: String(formData.get("paymentType") ?? "cash"), paidAmount, remainingAmount,
    notes: String(formData.get("notes") ?? ""),
  });

  // Auto-add quantity to raw material stock (Section 4).
  await db.update(rawMaterials).set({ stockQty: sql`${rawMaterials.stockQty} + ${quantity}` }).where(eq(rawMaterials.id, rawMaterialId));

  revalidatePath("/admin/inventory/raw-materials");
}

export async function createRawMaterial(formData: FormData) {
  await db.insert(rawMaterials).values({ name: String(formData.get("name")), unit: String(formData.get("unit") ?? "kg"), stockQty: 0 });
  revalidatePath("/admin/inventory/raw-materials");
}

export async function createCategory(formData: FormData) {
  await db.insert(categories).values({
    slug: String(formData.get("slug")),
    nameEn: String(formData.get("nameEn")),
    nameUr: String(formData.get("nameUr")),
    image: String(formData.get("image") ?? ""),
    sortOrder: Number(formData.get("sortOrder")) || 0,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  revalidatePath("/en/shop");
  revalidatePath("/ur/shop");
}

export async function updateCategory(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.update(categories).set({
    slug: String(formData.get("slug")),
    nameEn: String(formData.get("nameEn")),
    nameUr: String(formData.get("nameUr")),
    image: String(formData.get("image") ?? ""),
    sortOrder: Number(formData.get("sortOrder")) || 0,
  }).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  revalidatePath("/en/shop");
  revalidatePath("/ur/shop");
}

export async function createProduct(formData: FormData) {
  const slug = String(formData.get("slug"));
  await db.insert(products).values({
    slug, sku: String(formData.get("sku")), categoryId: Number(formData.get("categoryId")),
    nameEn: String(formData.get("nameEn")), nameUr: String(formData.get("nameUr")),
    taglineEn: String(formData.get("taglineEn") ?? ""), taglineUr: String(formData.get("taglineUr") ?? ""),
    descriptionEn: String(formData.get("descriptionEn") ?? ""), descriptionUr: String(formData.get("descriptionUr") ?? ""),
    ingredientsEn: String(formData.get("ingredientsEn") ?? ""), ingredientsUr: String(formData.get("ingredientsUr") ?? ""),
    usageEn: String(formData.get("usageEn") ?? ""), usageUr: String(formData.get("usageUr") ?? ""),
    weightLabel: String(formData.get("weightLabel")), price: Number(formData.get("price")),
    oldPrice: formData.get("oldPrice") ? Number(formData.get("oldPrice")) : null,
    image: String(formData.get("image") ?? ""),
    bestSeller: formData.get("bestSeller") === "on" ? 1 : 0,
    newArrival: formData.get("newArrival") === "on" ? 1 : 0,
    featured: formData.get("featured") === "on" ? 1 : 0,
    wholesaleEligible: formData.get("wholesaleEligible") === "on" ? 1 : 0,
    wholesalePrice: formData.get("wholesalePrice") ? Number(formData.get("wholesalePrice")) : null,
    websiteStockStatus: String(formData.get("websiteStockStatus") ?? "available"),
    websiteStockQty: formData.get("websiteStockQty") ? Number(formData.get("websiteStockQty")) : null,
    isHidden: formData.get("isHidden") === "on" ? 1 : 0,
    imageAltEn: String(formData.get("imageAltEn") ?? ""), imageAltUr: String(formData.get("imageAltUr") ?? ""),
  });
  revalidatePath("/admin/products");
  revalidatePath("/en");
  revalidatePath("/ur");
  revalidatePath("/en/shop");
  revalidatePath("/ur/shop");
  revalidatePath(`/en/product/${slug}`);
  revalidatePath(`/ur/product/${slug}`);
  redirect("/admin/products");
}

export async function createProcessingRecord(formData: FormData) {
  const rawMaterialId = Number(formData.get("rawMaterialId"));
  const qtySent = Number(formData.get("qtySent"));
  const actualOutput = Number(formData.get("actualOutput"));
  const wastageQty = qtySent - actualOutput;
  const wastagePercent = qtySent > 0 ? (wastageQty / qtySent) * 100 : 0;
  const batchNumber = `PB-${Math.floor(100000 + Math.random() * 900000)}`;
  const processingCost = Number(formData.get("processingCost")) || 0;

  const [record] = await db.insert(processingRecords).values({
    rawMaterialId, supplierId: Number(formData.get("supplierId")) || null,
    processingDate: String(formData.get("processingDate")), qtySent,
    processingCost, processor: String(formData.get("processor") ?? ""),
    expectedOutput: Number(formData.get("expectedOutput")) || null,
    actualOutput, wastageQty, wastagePercent, batchNumber,
    notes: String(formData.get("notes") ?? ""),
  }).returning();

  // Auto-deduct raw material stock (Section 5).
  await db.update(rawMaterials).set({ stockQty: sql`${rawMaterials.stockQty} - ${qtySent}` }).where(eq(rawMaterials.id, rawMaterialId));

  // Auto-create the finished-goods batch that carries this batch number forward (Section 6).
  await db.insert(finishedGoodsBatches).values({
    batchNumber, processingRecordId: record.id,
    productNameLabel: String(formData.get("productNameLabel") ?? ""),
    finalPowderQty: actualOutput, remainingQty: actualOutput, processingCost, createdAt: new Date().toISOString(),
  });

  revalidatePath("/admin/inventory/processing");
  revalidatePath("/admin/inventory/finished-goods");
}

export async function createPackagingRecord(formData: FormData) {
  const finishedGoodsBatchId = Number(formData.get("finishedGoodsBatchId"));
  const productId = Number(formData.get("productId"));
  const packSizeGrams = Number(formData.get("packSizeGrams"));
  const packetsProduced = Number(formData.get("packetsProduced"));
  const powderUsedQty = (packSizeGrams * packetsProduced) / 1000; // kg

  await db.insert(packagingRecords).values({
    finishedGoodsBatchId, productId, packagingDate: String(formData.get("packagingDate")),
    packSizeGrams, packetsProduced, powderUsedQty,
  });

  // Deduct from finished-goods remaining powder, add to that product's INTERNAL stock only —
  // website_stock_status / website_stock_qty / is_hidden are never touched here (Section 10).
  await db.update(finishedGoodsBatches).set({ remainingQty: sql`${finishedGoodsBatches.remainingQty} - ${powderUsedQty}` }).where(eq(finishedGoodsBatches.id, finishedGoodsBatchId));
  await db.update(products).set({ internalStockQty: sql`${products.internalStockQty} + ${packetsProduced}` }).where(eq(products.id, productId));

  revalidatePath("/admin/inventory/packaging");
  revalidatePath("/admin/inventory/finished-goods");
  revalidatePath("/admin/products");
}

// Section 10 — the ONLY function allowed to write website-facing stock fields.
export async function setWebsiteStock(formData: FormData) {
  const productId = Number(formData.get("productId"));
  await db.update(products).set({
    websiteStockStatus: String(formData.get("websiteStockStatus")),
    websiteStockQty: formData.get("websiteStockQty") ? Number(formData.get("websiteStockQty")) : null,
    isHidden: formData.get("isHidden") === "on" ? 1 : 0,
  }).where(eq(products.id, productId));
  revalidatePath("/admin/products");
}

export async function updateProductContent(formData: FormData) {
  const id = Number(formData.get("id"));
  const [existingProduct] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, id));
  const newSlug = String(formData.get("slug"));
  let image = String(formData.get("image") ?? "");
  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    if (!imageFile.type.startsWith("image/") || imageFile.size > 5 * 1024 * 1024) {
      throw new Error("Product images must be image files smaller than 5 MB.");
    }
    const extension = imageFile.type === "image/png" ? "png" : imageFile.type === "image/webp" ? "webp" : "jpg";
    const fileName = `product-${id}-${randomUUID()}.${extension}`;
    const imageDirectory = path.join(process.cwd(), "public", "images", "products");
    await mkdir(imageDirectory, { recursive: true });
    await writeFile(path.join(imageDirectory, fileName), Buffer.from(await imageFile.arrayBuffer()));
    image = `/images/products/${fileName}`;
  }
  await db.update(products).set({
    slug: newSlug, sku: String(formData.get("sku")),
    categoryId: Number(formData.get("categoryId")), image,
    weightLabel: String(formData.get("weightLabel")), price: Number(formData.get("price")),
    oldPrice: formData.get("oldPrice") ? Number(formData.get("oldPrice")) : null,
    bestSeller: formData.get("bestSeller") === "on" ? 1 : 0,
    newArrival: formData.get("newArrival") === "on" ? 1 : 0,
    featured: formData.get("featured") === "on" ? 1 : 0,
    wholesaleEligible: formData.get("wholesaleEligible") === "on" ? 1 : 0,
    wholesalePrice: formData.get("wholesalePrice") ? Number(formData.get("wholesalePrice")) : null,
    nameEn: String(formData.get("nameEn")), nameUr: String(formData.get("nameUr")),
    taglineEn: String(formData.get("taglineEn") ?? ""), taglineUr: String(formData.get("taglineUr") ?? ""),
    descriptionEn: String(formData.get("descriptionEn") ?? ""), descriptionUr: String(formData.get("descriptionUr") ?? ""),
    ingredientsEn: String(formData.get("ingredientsEn") ?? ""), ingredientsUr: String(formData.get("ingredientsUr") ?? ""),
    usageEn: String(formData.get("usageEn") ?? ""), usageUr: String(formData.get("usageUr") ?? ""),
    websiteStockStatus: String(formData.get("websiteStockStatus")),
    websiteStockQty: formData.get("websiteStockQty") ? Number(formData.get("websiteStockQty")) : null,
    isHidden: formData.get("isHidden") === "on" ? 1 : 0,
    metaTitleEn: String(formData.get("metaTitleEn") ?? ""), metaTitleUr: String(formData.get("metaTitleUr") ?? ""),
    metaDescriptionEn: String(formData.get("metaDescriptionEn") ?? ""), metaDescriptionUr: String(formData.get("metaDescriptionUr") ?? ""),
    canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    noIndex: formData.get("noIndex") === "on" ? 1 : 0,
    imageAltEn: String(formData.get("imageAltEn") ?? ""), imageAltUr: String(formData.get("imageAltUr") ?? ""),
  }).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/en");
  revalidatePath("/ur");
  revalidatePath("/en/shop");
  revalidatePath("/ur/shop");
  if (existingProduct?.slug) {
    revalidatePath(`/en/product/${existingProduct.slug}`);
    revalidatePath(`/ur/product/${existingProduct.slug}`);
  }
  revalidatePath(`/en/product/${newSlug}`);
  revalidatePath(`/ur/product/${newSlug}`);
  redirect(`/admin/products/${id}`);
}

export async function moderateReview(formData: FormData) {
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  if (action === "delete") {
    await db.delete(reviews).where(eq(reviews.id, id));
  } else {
    await db.update(reviews).set({ status: action }).where(eq(reviews.id, id));
  }
  revalidatePath("/admin/reviews");
}

export async function linkOrderItemToPackaging(formData: FormData) {
  const { orderItems } = await import("@/db/schema");
  const itemId = Number(formData.get("itemId"));
  const packagingRecordId = Number(formData.get("packagingRecordId"));
  await db.update(orderItems).set({ packagingRecordId }).where(eq(orderItems.id, itemId));
  revalidatePath(`/admin/orders`);
}

export async function updateSettings(formData: FormData) {
  const { settings } = await import("@/db/schema");
  const keys = ["whatsapp_automation_enabled", "whatsapp_template"];
  for (const key of keys) {
    const value = formData.get(key);
    if (value !== null) {
      await db.update(settings).set({ value: String(value) }).where(eq(settings.key, key));
    }
  }
  revalidatePath("/admin/settings");
}
