"use server";
import { db } from "@/db";
import {
  categories, suppliers, rawMaterials, rawMaterialPurchases, processingRecords, finishedGoodsBatches,
  packagingRecords, products, reviews, bundles, bundleItems, orderItems, settings,
} from "@/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploads";
import { parseGrammageOptions } from "@/lib/grammage";

// ---------------------------------------------------------------------------
// Small helpers so every form behaves the same way:
//   - only logged-in admins can run an action
//   - after saving, the admin lands back on the page with a green "Saved" message
//   - on a problem, they land back with a red message explaining what to fix
// ---------------------------------------------------------------------------
function withParam(path: string, key: string, message: string) {
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(message)}`;
}
function done(path: string, message: string): never {
  redirect(withParam(path, "ok", message));
}
function fail(path: string, message: string): never {
  redirect(withParam(path, "error", message));
}
function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
function num(fd: FormData, key: string) {
  const raw = text(fd, key);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
function checked(fd: FormData, key: string) {
  return fd.get(key) === "on" ? 1 : 0;
}
export async function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
// Storefront pages are cached; this refreshes all of them after a catalog change.
function refreshSite() {
  revalidatePath("/", "layout");
}
async function imageFromForm(fd: FormData, prefix: string, backTo: string) {
  try {
    const uploaded = await saveUploadedImage(fd.get("imageFile"), prefix);
    return uploaded ?? text(fd, "image");
  } catch (error) {
    fail(backTo, error instanceof Error ? error.message : "Image upload failed.");
  }
}
function statusValue(value: string) {
  return ["available", "limited", "out_of_stock"].includes(value) ? value : "available";
}

// ---------------------------------------------------------------------------
// SUPPLIERS
// ---------------------------------------------------------------------------
export async function createSupplier(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  if (!name) fail("/admin/suppliers", "Supplier name is required.");
  await db.insert(suppliers).values({
    name,
    contact: text(formData, "contact"),
    address: text(formData, "address"),
    suppliedMaterials: text(formData, "suppliedMaterials"),
    paymentType: text(formData, "paymentType") || "cash",
    notes: text(formData, "notes"),
  });
  revalidatePath("/admin/suppliers");
  done("/admin/suppliers", `Supplier "${name}" added.`);
}

export async function updateSupplier(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  if (!name) fail("/admin/suppliers", "Supplier name is required.");
  await db.update(suppliers).set({
    name,
    contact: text(formData, "contact"),
    address: text(formData, "address"),
    suppliedMaterials: text(formData, "suppliedMaterials"),
    paymentType: text(formData, "paymentType") || "cash",
    notes: text(formData, "notes"),
  }).where(eq(suppliers.id, Number(formData.get("id"))));
  revalidatePath("/admin/suppliers");
  done("/admin/suppliers", `Supplier "${name}" updated.`);
}

// ---------------------------------------------------------------------------
// RAW MATERIALS / PURCHASES
// ---------------------------------------------------------------------------
const RAW = "/admin/inventory/raw-materials";

export async function createRawMaterial(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  if (!name) fail(RAW, "Raw material name is required.");
  const [existing] = await db.select().from(rawMaterials).where(sql`lower(${rawMaterials.name}) = ${name.toLowerCase()}`);
  if (existing) fail(RAW, `"${name}" already exists.`);
  await db.insert(rawMaterials).values({ name, unit: text(formData, "unit") || "kg", stockQty: 0 });
  revalidatePath(RAW);
  done(RAW, `Raw material "${name}" added.`);
}

export async function updateRawMaterial(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const name = text(formData, "name");
  if (!name) fail(RAW, "Raw material name is required.");
  const [duplicate] = await db.select().from(rawMaterials).where(and(sql`lower(${rawMaterials.name}) = ${name.toLowerCase()}`, ne(rawMaterials.id, id)));
  if (duplicate) fail(RAW, `Another material is already called "${name}".`);
  await db.update(rawMaterials).set({ name, unit: text(formData, "unit") || "kg" }).where(eq(rawMaterials.id, id));
  revalidatePath(RAW);
  done(RAW, "Raw material updated.");
}

export async function createRawMaterialPurchase(formData: FormData) {
  await requireAdmin();
  const rawMaterialId = Number(formData.get("rawMaterialId"));
  const supplierId = Number(formData.get("supplierId"));
  const quantity = num(formData, "quantity") ?? 0;
  const purchaseRate = num(formData, "purchaseRate") ?? 0;
  const paymentType = text(formData, "paymentType") || "cash";
  const purchaseDate = text(formData, "purchaseDate");
  const [material] = await db.select().from(rawMaterials).where(eq(rawMaterials.id, rawMaterialId));

  if (!material) fail(RAW, "Please choose a raw material (add one first if the list is empty).");
  if (!supplierId) fail(RAW, "Please choose a supplier (add one on the Suppliers page first).");
  if (!purchaseDate) fail(RAW, "Please enter the purchase date.");
  if (quantity <= 0) fail(RAW, "Quantity must be more than 0.");
  const unit = text(formData, "unit") || material.unit;
  const totalCost = Math.round(quantity * purchaseRate * 100) / 100;
  // Left blank: a cash purchase is treated as fully paid, a credit purchase as unpaid.
  const paidAmount = num(formData, "paidAmount") ?? (paymentType === "cash" ? totalCost : 0);
  if (purchaseRate < 0 || paidAmount < 0) fail(RAW, "Rate and paid amount cannot be negative.");
  if (paidAmount > totalCost) fail(RAW, `Paid amount (Rs. ${paidAmount}) cannot be more than the total cost (Rs. ${totalCost}).`);
  const remainingAmount = Math.round((totalCost - paidAmount) * 100) / 100;

  await db.insert(rawMaterialPurchases).values({
    supplierId, rawMaterialId, purchaseDate, quantity, unit, purchaseRate, totalCost,
    paymentType, paidAmount, remainingAmount,
    notes: text(formData, "notes"),
  });

  // Add to stock in the material's own unit (e.g. 500 g bought for a "kg" material adds 0.5 kg).
  let stockAdd = quantity;
  if (unit === "g" && material.unit === "kg") stockAdd = quantity / 1000;
  if (unit === "kg" && material.unit === "g") stockAdd = quantity * 1000;
  await db.update(rawMaterials).set({ stockQty: sql`${rawMaterials.stockQty} + ${stockAdd}` }).where(eq(rawMaterials.id, rawMaterialId));

  revalidatePath(RAW);
  revalidatePath("/admin/suppliers");
  done(RAW, `Purchase saved. ${stockAdd} ${material.unit} added to ${material.name} stock.`);
}

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
const CATS = "/admin/categories";

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const nameEn = text(formData, "nameEn");
  const nameUr = text(formData, "nameUr") || nameEn;
  const slug = (await slugify(text(formData, "slug") || nameEn));
  if (!nameEn || !slug) fail(CATS, "English name is required.");
  const [dup] = await db.select().from(categories).where(eq(categories.slug, slug));
  if (dup) fail(CATS, `A category with the web address "${slug}" already exists.`);
  await db.insert(categories).values({ slug, nameEn, nameUr, image: text(formData, "image"), sortOrder: num(formData, "sortOrder") ?? 0 });
  revalidatePath(CATS);
  refreshSite();
  done(CATS, `Category "${nameEn}" added.`);
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const nameEn = text(formData, "nameEn");
  const nameUr = text(formData, "nameUr") || nameEn;
  const slug = (await slugify(text(formData, "slug") || nameEn));
  if (!nameEn || !slug) fail(CATS, "English name is required.");
  const [dup] = await db.select().from(categories).where(and(eq(categories.slug, slug), ne(categories.id, id)));
  if (dup) fail(CATS, `Another category already uses the web address "${slug}".`);
  await db.update(categories).set({ slug, nameEn, nameUr, image: text(formData, "image"), sortOrder: num(formData, "sortOrder") ?? 0 }).where(eq(categories.id, id));
  revalidatePath(CATS);
  refreshSite();
  done(CATS, `Category "${nameEn}" saved.`);
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const inUse = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, id));
  if (inUse.length > 0) fail(CATS, `This category still has ${inUse.length} product(s). Move them to another category first.`);
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath(CATS);
  refreshSite();
  done(CATS, "Category deleted.");
}

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------
function productFieldsFromForm(formData: FormData) {
  const options = parseGrammageOptions(text(formData, "grammageOptions"), text(formData, "weightLabel") || "1 pack", num(formData, "price") ?? 0)
    .filter((o) => o.label && o.price >= 0);
  const first = options[0];
  return {
    categoryId: Number(formData.get("categoryId")),
    nameEn: text(formData, "nameEn"),
    nameUr: text(formData, "nameUr"),
    taglineEn: text(formData, "taglineEn"), taglineUr: text(formData, "taglineUr"),
    descriptionEn: text(formData, "descriptionEn"), descriptionUr: text(formData, "descriptionUr"),
    ingredientsEn: text(formData, "ingredientsEn"), ingredientsUr: text(formData, "ingredientsUr"),
    usageEn: text(formData, "usageEn"), usageUr: text(formData, "usageUr"),
    // The first size is the "main" size shown on product cards.
    weightLabel: first?.label ?? "1 pack",
    price: first?.price ?? 0,
    grammageOptions: JSON.stringify(options),
    oldPrice: num(formData, "oldPrice"),
    bestSeller: checked(formData, "bestSeller"),
    newArrival: checked(formData, "newArrival"),
    featured: checked(formData, "featured"),
    wholesaleEligible: checked(formData, "wholesaleEligible"),
    wholesalePrice: num(formData, "wholesalePrice"),
    websiteStockStatus: statusValue(text(formData, "websiteStockStatus")),
    websiteStockQty: num(formData, "websiteStockQty"),
    isHidden: checked(formData, "isHidden"),
    imageAltEn: text(formData, "imageAltEn"), imageAltUr: text(formData, "imageAltUr"),
    optionCount: options.length,
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const back = "/admin/products/new";
  const { optionCount, ...fields } = productFieldsFromForm(formData);
  if (!fields.nameEn) fail(back, "English name is required.");
  if (!fields.categoryId) fail(back, "Please choose a category.");
  if (optionCount === 0 || fields.price <= 0) fail(back, "Add at least one size with a price above 0.");
  if (!fields.nameUr) fields.nameUr = fields.nameEn;

  const slug = await slugify(text(formData, "slug") || fields.nameEn);
  const [slugTaken] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug));
  if (slugTaken) fail(back, `Another product already uses the web address "${slug}". Please change the name or web address.`);
  let sku = text(formData, "sku");
  if (!sku) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(products);
    sku = `AURA-${String(Number(count) + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`;
  }
  const [skuTaken] = await db.select({ id: products.id }).from(products).where(eq(products.sku, sku));
  if (skuTaken) fail(back, `SKU "${sku}" is already used by another product.`);

  const image = await imageFromForm(formData, "product", back);
  const [created] = await db.insert(products).values({ ...fields, slug, sku, image }).returning();
  revalidatePath("/admin/products");
  refreshSite();
  done(`/admin/products/${created.id}`, `Product "${fields.nameEn}" created.`);
}

export async function updateProductContent(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const back = `/admin/products/${id}`;
  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) fail("/admin/products", "That product no longer exists.");

  const { optionCount, ...fields } = productFieldsFromForm(formData);
  if (!fields.nameEn) fail(back, "English name is required.");
  if (optionCount === 0 || fields.price <= 0) fail(back, "Add at least one size with a price above 0.");
  if (!fields.nameUr) fields.nameUr = fields.nameEn;

  const slug = await slugify(text(formData, "slug") || fields.nameEn);
  const [slugTaken] = await db.select({ id: products.id }).from(products).where(and(eq(products.slug, slug), ne(products.id, id)));
  if (slugTaken) fail(back, `Another product already uses the web address "${slug}".`);
  const sku = text(formData, "sku") || existing.sku;
  const [skuTaken] = await db.select({ id: products.id }).from(products).where(and(eq(products.sku, sku), ne(products.id, id)));
  if (skuTaken) fail(back, `SKU "${sku}" is already used by another product.`);

  const image = await imageFromForm(formData, `product-${id}`, back);
  await db.update(products).set({
    ...fields, slug, sku, image,
    metaTitleEn: text(formData, "metaTitleEn"), metaTitleUr: text(formData, "metaTitleUr"),
    metaDescriptionEn: text(formData, "metaDescriptionEn"), metaDescriptionUr: text(formData, "metaDescriptionUr"),
    canonicalUrl: text(formData, "canonicalUrl"),
    noIndex: checked(formData, "noIndex"),
  }).where(eq(products.id, id));
  revalidatePath("/admin/products");
  refreshSite();
  done(back, "Product saved. Changes are live on the website.");
}

// Quick stock/visibility change from the products list. Website-facing stock is only ever written
// by admins (here or on the edit page) — never by the inventory/packaging code.
export async function setWebsiteStock(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("productId"));
  await db.update(products).set({
    websiteStockStatus: statusValue(text(formData, "websiteStockStatus")),
    websiteStockQty: num(formData, "websiteStockQty"),
    isHidden: checked(formData, "isHidden"),
  }).where(eq(products.id, productId));
  revalidatePath("/admin/products");
  refreshSite();
  done("/admin/products", "Website stock updated.");
}

// ---------------------------------------------------------------------------
// BUNDLES
// ---------------------------------------------------------------------------
const BUNDLES = "/admin/bundles";

function bundleItemsFromForm(formData: FormData, bundleId: number) {
  const productIds = formData.getAll("productId").map(Number);
  const quantities = formData.getAll("quantity").map((value) => Math.max(1, Math.round(Number(value)) || 1));
  const merged = new Map<number, number>();
  productIds.forEach((productId, index) => {
    if (productId > 0) merged.set(productId, (merged.get(productId) ?? 0) + (quantities[index] ?? 1));
  });
  return [...merged].map(([productId, quantity]) => ({ bundleId, productId, quantity }));
}

export async function createBundle(formData: FormData) {
  await requireAdmin();
  const nameEn = text(formData, "nameEn");
  const price = num(formData, "price") ?? 0;
  if (!nameEn) fail(BUNDLES, "Bundle name is required.");
  if (price <= 0) fail(BUNDLES, "Bundle price must be more than 0.");
  if (bundleItemsFromForm(formData, 0).length === 0) fail(BUNDLES, "Choose at least one product for the bundle.");
  const slug = await slugify(text(formData, "slug") || nameEn);
  const [taken] = await db.select({ id: bundles.id }).from(bundles).where(eq(bundles.slug, slug));
  if (taken) fail(BUNDLES, `Another bundle already uses the web address "${slug}".`);
  const image = await imageFromForm(formData, "bundle", BUNDLES);

  const [bundle] = await db.insert(bundles).values({
    slug, nameEn, nameUr: text(formData, "nameUr") || nameEn,
    descriptionEn: text(formData, "descriptionEn"), descriptionUr: text(formData, "descriptionUr"),
    price, oldPrice: num(formData, "oldPrice"), image,
    websiteStockStatus: statusValue(text(formData, "websiteStockStatus")),
    isHidden: checked(formData, "isHidden"),
  }).returning();
  await db.insert(bundleItems).values(bundleItemsFromForm(formData, bundle.id));
  revalidatePath(BUNDLES);
  refreshSite();
  done(BUNDLES, `Bundle "${nameEn}" created.`);
}

export async function updateBundle(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const nameEn = text(formData, "nameEn");
  const price = num(formData, "price") ?? 0;
  if (!nameEn) fail(BUNDLES, "Bundle name is required.");
  if (price <= 0) fail(BUNDLES, "Bundle price must be more than 0.");
  const items = bundleItemsFromForm(formData, id);
  if (items.length === 0) fail(BUNDLES, "A bundle needs at least one product.");
  const slug = await slugify(text(formData, "slug") || nameEn);
  const [taken] = await db.select({ id: bundles.id }).from(bundles).where(and(eq(bundles.slug, slug), ne(bundles.id, id)));
  if (taken) fail(BUNDLES, `Another bundle already uses the web address "${slug}".`);
  const image = await imageFromForm(formData, `bundle-${id}`, BUNDLES);

  await db.update(bundles).set({
    slug, nameEn, nameUr: text(formData, "nameUr") || nameEn,
    descriptionEn: text(formData, "descriptionEn"), descriptionUr: text(formData, "descriptionUr"),
    price, oldPrice: num(formData, "oldPrice"), image,
    websiteStockStatus: statusValue(text(formData, "websiteStockStatus")),
    isHidden: checked(formData, "isHidden"),
  }).where(eq(bundles.id, id));
  await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
  await db.insert(bundleItems).values(items);
  revalidatePath(BUNDLES);
  refreshSite();
  done(BUNDLES, `Bundle "${nameEn}" saved.`);
}

export async function deleteBundle(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.delete(bundleItems).where(eq(bundleItems.bundleId, id));
  await db.delete(bundles).where(eq(bundles.id, id));
  revalidatePath(BUNDLES);
  refreshSite();
  done(BUNDLES, "Bundle deleted. Past orders that included it are not affected.");
}

// ---------------------------------------------------------------------------
// PRODUCTION: PROCESSING -> FINISHED GOODS -> PACKAGING
// ---------------------------------------------------------------------------
const PROC = "/admin/inventory/processing";
const PACK = "/admin/inventory/packaging";

export async function createProcessingRecord(formData: FormData) {
  await requireAdmin();
  const rawMaterialId = Number(formData.get("rawMaterialId"));
  const qtySent = num(formData, "qtySent") ?? 0;
  const actualOutput = num(formData, "actualOutput") ?? 0;
  const processingDate = text(formData, "processingDate");
  const productNameLabel = text(formData, "productNameLabel");
  const [material] = await db.select().from(rawMaterials).where(eq(rawMaterials.id, rawMaterialId));

  if (!material) fail(PROC, "Please choose a raw material.");
  if (!processingDate) fail(PROC, "Please enter the processing date.");
  if (!productNameLabel) fail(PROC, "Please enter the output product label.");
  if (qtySent <= 0) fail(PROC, "Quantity sent must be more than 0.");
  if (qtySent > material.stockQty) fail(PROC, `Only ${material.stockQty} ${material.unit} of ${material.name} is in stock. Log a purchase first or reduce the quantity.`);
  if (actualOutput <= 0) fail(PROC, "Actual output must be more than 0.");
  if (actualOutput > qtySent) fail(PROC, "Actual output cannot be more than the quantity sent for grinding.");

  const wastageQty = Math.round((qtySent - actualOutput) * 1000) / 1000;
  const wastagePercent = qtySent > 0 ? (wastageQty / qtySent) * 100 : 0;
  let batchNumber = "";
  for (let i = 0; i < 20 && !batchNumber; i++) {
    const candidate = `PB-${Math.floor(100000 + Math.random() * 900000)}`;
    const [clash] = await db.select({ id: processingRecords.id }).from(processingRecords).where(eq(processingRecords.batchNumber, candidate));
    if (!clash) batchNumber = candidate;
  }
  if (!batchNumber) batchNumber = `PB-${Date.now()}`;
  const processingCost = num(formData, "processingCost") ?? 0;

  const [record] = await db.insert(processingRecords).values({
    rawMaterialId, supplierId: Number(formData.get("supplierId")) || null,
    processingDate, qtySent, processingCost, processor: text(formData, "processor"),
    expectedOutput: num(formData, "expectedOutput"),
    actualOutput, wastageQty, wastagePercent, batchNumber,
    notes: text(formData, "notes"),
  }).returning();

  await db.update(rawMaterials).set({ stockQty: sql`${rawMaterials.stockQty} - ${qtySent}` }).where(eq(rawMaterials.id, rawMaterialId));

  await db.insert(finishedGoodsBatches).values({
    batchNumber, processingRecordId: record.id, productNameLabel,
    finalPowderQty: actualOutput, remainingQty: actualOutput, processingCost, createdAt: new Date().toISOString(),
  });

  revalidatePath(PROC);
  revalidatePath(RAW);
  revalidatePath("/admin/inventory/finished-goods");
  done(PROC, `Saved. Batch ${batchNumber} created with ${actualOutput} kg of powder (wastage ${wastagePercent.toFixed(1)}%).`);
}

export async function createPackagingRecord(formData: FormData) {
  await requireAdmin();
  const finishedGoodsBatchId = Number(formData.get("finishedGoodsBatchId"));
  const productId = Number(formData.get("productId"));
  const packSizeGrams = Number(formData.get("packSizeGrams"));
  const packetsProduced = Math.round(num(formData, "packetsProduced") ?? 0);
  const packagingDate = text(formData, "packagingDate");
  const [batch] = await db.select().from(finishedGoodsBatches).where(eq(finishedGoodsBatches.id, finishedGoodsBatchId));
  const [product] = await db.select().from(products).where(eq(products.id, productId));

  if (!batch) fail(PACK, "Please choose a finished-goods batch (create a processing record first).");
  if (!product) fail(PACK, "Please choose a product.");
  if (!packagingDate) fail(PACK, "Please enter the packaging date.");
  if (!packSizeGrams || packSizeGrams <= 0) fail(PACK, "Please choose a pack size.");
  if (packetsProduced <= 0) fail(PACK, "Packets produced must be at least 1.");
  const powderUsedQty = (packSizeGrams * packetsProduced) / 1000; // kg
  if (powderUsedQty > batch.remainingQty + 1e-9) {
    fail(PACK, `That needs ${powderUsedQty} kg of powder but batch ${batch.batchNumber} only has ${batch.remainingQty.toFixed(2)} kg left.`);
  }

  await db.insert(packagingRecords).values({ finishedGoodsBatchId, productId, packagingDate, packSizeGrams, packetsProduced, powderUsedQty });

  // Deduct from the batch and add to the product's INTERNAL stock only — the website stock
  // status customers see is never changed here.
  await db.update(finishedGoodsBatches).set({ remainingQty: sql`${finishedGoodsBatches.remainingQty} - ${powderUsedQty}` }).where(eq(finishedGoodsBatches.id, finishedGoodsBatchId));
  await db.update(products).set({ internalStockQty: sql`${products.internalStockQty} + ${packetsProduced}` }).where(eq(products.id, productId));

  revalidatePath(PACK);
  revalidatePath("/admin/inventory/finished-goods");
  revalidatePath("/admin/products");
  done(PACK, `Saved. ${packetsProduced} packets added to ${product.nameEn} internal stock (${powderUsedQty} kg powder used).`);
}

// ---------------------------------------------------------------------------
// REVIEWS / ORDERS / SETTINGS
// ---------------------------------------------------------------------------
export async function moderateReview(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  if (action === "delete") {
    await db.delete(reviews).where(eq(reviews.id, id));
  } else if (action === "approved" || action === "rejected" || action === "pending") {
    await db.update(reviews).set({ status: action }).where(eq(reviews.id, id));
  }
  revalidatePath("/admin/reviews");
  refreshSite();
  done("/admin/reviews", action === "delete" ? "Review deleted." : `Review ${action}.`);
}

export async function linkOrderItemToPackaging(formData: FormData) {
  await requireAdmin();
  const itemId = Number(formData.get("itemId"));
  const orderId = Number(formData.get("orderId"));
  const packagingRecordId = Number(formData.get("packagingRecordId")) || null;
  await db.update(orderItems).set({ packagingRecordId }).where(eq(orderItems.id, itemId));
  revalidatePath(`/admin/orders/${orderId}`);
  done(`/admin/orders/${orderId}`, packagingRecordId ? "Item linked to packaging batch." : "Item unlinked.");
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  // A checkbox only sends a value when ticked.
  const enabled = formData.getAll("whatsapp_automation_enabled").includes("true") ? "true" : "false";
  const values: [string, string][] = [["whatsapp_automation_enabled", enabled]];
  const template = formData.get("whatsapp_template");
  if (template !== null) values.push(["whatsapp_template", String(template)]);
  for (const [key, value] of values) {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  revalidatePath("/admin/settings");
  done("/admin/settings", `Settings saved. WhatsApp automation is ${enabled === "true" ? "ON" : "OFF"}.`);
}
