import { pgTable, text, integer, doublePrecision, serial, customType } from "drizzle-orm/pg-core";

// Raw bytes column (PostgreSQL "bytea") used to keep uploaded images inside the database.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

// ---------------------------------------------------------------------------
// CATALOG (bilingual + independent website-stock control + SEO)
// ---------------------------------------------------------------------------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameUr: text("name_ur").notNull(),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  categoryId: integer("category_id").notNull(),
  nameEn: text("name_en").notNull(),
  nameUr: text("name_ur").notNull(),
  taglineEn: text("tagline_en"),
  taglineUr: text("tagline_ur"),
  descriptionEn: text("description_en"),
  descriptionUr: text("description_ur"),
  ingredientsEn: text("ingredients_en"),
  ingredientsUr: text("ingredients_ur"),
  usageEn: text("usage_en"),
  usageUr: text("usage_ur"),
  weightLabel: text("weight_label").notNull(),
  grammageOptions: text("grammage_options"),
  price: doublePrecision("price").notNull(),
  oldPrice: doublePrecision("old_price"),
  image: text("image"),
  bestSeller: integer("best_seller").default(0),
  newArrival: integer("new_arrival").default(0),
  featured: integer("featured").default(0),
  wholesaleEligible: integer("wholesale_eligible").default(1),
  wholesalePrice: doublePrecision("wholesale_price"),

  // Section 5.1 — website-facing display, ADMIN-CONTROLLED ONLY.
  // Never written by any inventory/production code path (see products.internalStockQty below).
  websiteStockStatus: text("website_stock_status").notNull().default("available"), // available|limited|out_of_stock
  websiteStockQty: integer("website_stock_qty"), // optional manual display quantity
  isHidden: integer("is_hidden").default(0),

  // Internal business record — completely separate from the above. Only Phase-2 inventory
  // code (packaging) is allowed to write this field. See src/lib/inventory.ts.
  internalStockQty: integer("internal_stock_qty").default(0),

  // SEO control panel (Section 4 / 6.9)
  metaTitleEn: text("meta_title_en"),
  metaTitleUr: text("meta_title_ur"),
  metaDescriptionEn: text("meta_description_en"),
  metaDescriptionUr: text("meta_description_ur"),
  canonicalUrl: text("canonical_url"),
  noIndex: integer("no_index").default(0),
  imageAltEn: text("image_alt_en"),
  imageAltUr: text("image_alt_ur"),
});

export const bundles = pgTable("bundles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameUr: text("name_ur").notNull(),
  descriptionEn: text("description_en"),
  descriptionUr: text("description_ur"),
  price: doublePrecision("price").notNull(),
  oldPrice: doublePrecision("old_price"),
  image: text("image"),
  websiteStockStatus: text("website_stock_status").notNull().default("available"),
  isHidden: integer("is_hidden").default(0),
});

export const bundleItems = pgTable("bundle_items", {
  id: serial("id").primaryKey(),
  bundleId: integer("bundle_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// ---------------------------------------------------------------------------
// ORDERS — one unified table for website + every manual/offline channel
// ---------------------------------------------------------------------------
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  source: text("source").notNull(), // website|facebook|instagram|tiktok|whatsapp|offline|phone|other
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address").notNull(),
  city: text("city"),
  subtotal: doublePrecision("subtotal").notNull(),
  discount: doublePrecision("discount").default(0),
  deliveryCharges: doublePrecision("delivery_charges").default(0),
  total: doublePrecision("total").notNull(),
  paymentMethod: text("payment_method").notNull(), // cod
  paymentStatus: text("payment_status").notNull().default("pending"), // pending|paid|failed|refunded
  transactionId: text("transaction_id"),
  paymentDate: text("payment_date"),
  orderStatus: text("order_status").notNull().default("pending"), // pending|confirmed|cancelled|delivered
  // WhatsApp confirmation workflow (Section 11)
  whatsappConfirmationStatus: text("whatsapp_confirmation_status").notNull().default("not_sent"),
  // not_sent|sent|confirmed|cancellation_requested|no_response|no_whatsapp
  whatsappSentAt: text("whatsapp_sent_at"),
  whatsappRespondedAt: text("whatsapp_responded_at"),
  notes: text("notes"),
  enteredByAdminId: integer("entered_by_admin_id"),
  createdAt: text("created_at").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  packagingRecordId: integer("packaging_record_id"), // Stock Fulfilment link, see traceability
  bundleId: integer("bundle_id"),
});

// ---------------------------------------------------------------------------
// REVIEWS (verified purchase, locked after submit)
// ---------------------------------------------------------------------------
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  verifiedOrderId: integer("verified_order_id").notNull(),
  status: text("status").notNull().default("pending"), // pending|approved|rejected
  createdAt: text("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// SUPPLIERS / RAW MATERIAL / PRODUCTION / TRACEABILITY (Phase 2, Sections 6.3-6.8)
// ---------------------------------------------------------------------------
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact"),
  address: text("address"),
  suppliedMaterials: text("supplied_materials"),
  paymentType: text("payment_type").default("cash"), // cash|credit
  notes: text("notes"),
});

export const rawMaterials = pgTable("raw_materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull().default("kg"),
  stockQty: doublePrecision("stock_qty").notNull().default(0),
});

export const rawMaterialPurchases = pgTable("raw_material_purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  rawMaterialId: integer("raw_material_id").notNull(),
  purchaseDate: text("purchase_date").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  purchaseRate: doublePrecision("purchase_rate").notNull(),
  totalCost: doublePrecision("total_cost").notNull(),
  paymentType: text("payment_type").notNull().default("cash"), // cash|credit
  paidAmount: doublePrecision("paid_amount").notNull().default(0),
  remainingAmount: doublePrecision("remaining_amount").notNull().default(0),
  notes: text("notes"),
});

export const processingRecords = pgTable("processing_records", {
  id: serial("id").primaryKey(),
  rawMaterialId: integer("raw_material_id").notNull(),
  purchaseRefId: integer("purchase_ref_id"),
  supplierId: integer("supplier_id"),
  processingDate: text("processing_date").notNull(),
  qtySent: doublePrecision("qty_sent").notNull(),
  processingCost: doublePrecision("processing_cost").default(0),
  processor: text("processor"),
  expectedOutput: doublePrecision("expected_output"),
  actualOutput: doublePrecision("actual_output").notNull(),
  wastageQty: doublePrecision("wastage_qty").notNull(),
  wastagePercent: doublePrecision("wastage_percent").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  notes: text("notes"),
});

export const finishedGoodsBatches = pgTable("finished_goods_batches", {
  id: serial("id").primaryKey(),
  batchNumber: text("batch_number").notNull().unique(),
  processingRecordId: integer("processing_record_id").notNull(),
  productNameLabel: text("product_name_label").notNull(),
  finalPowderQty: doublePrecision("final_powder_qty").notNull(),
  remainingQty: doublePrecision("remaining_qty").notNull(),
  processingCost: doublePrecision("processing_cost").default(0),
  createdAt: text("created_at").notNull(),
});

export const packagingRecords = pgTable("packaging_records", {
  id: serial("id").primaryKey(),
  finishedGoodsBatchId: integer("finished_goods_batch_id").notNull(),
  productId: integer("product_id").notNull(),
  packagingDate: text("packaging_date").notNull(),
  packSizeGrams: integer("pack_size_grams").notNull(), // 50,100,150,200,250,500,1000
  packetsProduced: integer("packets_produced").notNull(),
  powderUsedQty: doublePrecision("powder_used_qty").notNull(),
});

// ---------------------------------------------------------------------------
// ADMIN / SETTINGS
// ---------------------------------------------------------------------------
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ---------------------------------------------------------------------------
// UPLOADED IMAGES — stored in the database so they survive every redeploy
// ---------------------------------------------------------------------------
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g. product-1f2e....jpg, served at /uploads/<name>
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: text("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// CONTACT & SUPPORT MESSAGES (admin inbox)
// ---------------------------------------------------------------------------
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // contact|support
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  category: text("category"),
  subject: text("subject"),
  orderNumber: text("order_number"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new|read|archived
  createdAt: text("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// EDITABLE WEBSITE CONTENT
// ---------------------------------------------------------------------------
// Repeating blocks edited from Admin → Website Content.
// kind: faq | testimonial | why (home "Why Aura Foods") | value (About "What we stand for") | blog
export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  titleEn: text("title_en").notNull().default(""), // question / customer name / heading / post title
  titleUr: text("title_ur").notNull().default(""),
  bodyEn: text("body_en").notNull().default(""), // answer / quote / text / excerpt
  bodyUr: text("body_ur").notNull().default(""),
  extraEn: text("extra_en"), // testimonial city / blog category
  extraUr: text("extra_ur"),
  meta: text("meta"), // blog read time, e.g. "5 min"
  image: text("image"),
  isHidden: integer("is_hidden").notNull().default(0),
});

// Simple pages (privacy, returns, shipping, terms) edited from Admin → Pages.
export const pages = pgTable("pages", {
  slug: text("slug").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleUr: text("title_ur").notNull(),
  bodyEn: text("body_en").notNull(),
  bodyUr: text("body_ur").notNull(),
});
