import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// CATALOG (bilingual + independent website-stock control + SEO)
// ---------------------------------------------------------------------------
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameUr: text("name_ur").notNull(),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  price: real("price").notNull(),
  oldPrice: real("old_price"),
  image: text("image"),
  bestSeller: integer("best_seller").default(0),
  newArrival: integer("new_arrival").default(0),
  featured: integer("featured").default(0),
  wholesaleEligible: integer("wholesale_eligible").default(1),
  wholesalePrice: real("wholesale_price"),

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

// ---------------------------------------------------------------------------
// ORDERS — one unified table for website + every manual/offline channel
// ---------------------------------------------------------------------------
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  source: text("source").notNull(), // website|facebook|instagram|tiktok|whatsapp|offline|phone|other
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address").notNull(),
  city: text("city"),
  subtotal: real("subtotal").notNull(),
  discount: real("discount").default(0),
  deliveryCharges: real("delivery_charges").default(0),
  total: real("total").notNull(),
  paymentMethod: text("payment_method").notNull(), // cod|card|jazzcash|easypaisa
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

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  packagingRecordId: integer("packaging_record_id"), // Stock Fulfilment link, see traceability
});

// ---------------------------------------------------------------------------
// REVIEWS (verified purchase, locked after submit)
// ---------------------------------------------------------------------------
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contact: text("contact"),
  address: text("address"),
  suppliedMaterials: text("supplied_materials"),
  paymentType: text("payment_type").default("cash"), // cash|credit
  notes: text("notes"),
});

export const rawMaterials = sqliteTable("raw_materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull().default("kg"),
  stockQty: real("stock_qty").notNull().default(0),
});

export const rawMaterialPurchases = sqliteTable("raw_material_purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  supplierId: integer("supplier_id").notNull(),
  rawMaterialId: integer("raw_material_id").notNull(),
  purchaseDate: text("purchase_date").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  purchaseRate: real("purchase_rate").notNull(),
  totalCost: real("total_cost").notNull(),
  paymentType: text("payment_type").notNull().default("cash"), // cash|credit
  paidAmount: real("paid_amount").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull().default(0),
  notes: text("notes"),
});

export const processingRecords = sqliteTable("processing_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rawMaterialId: integer("raw_material_id").notNull(),
  purchaseRefId: integer("purchase_ref_id"),
  supplierId: integer("supplier_id"),
  processingDate: text("processing_date").notNull(),
  qtySent: real("qty_sent").notNull(),
  processingCost: real("processing_cost").default(0),
  processor: text("processor"),
  expectedOutput: real("expected_output"),
  actualOutput: real("actual_output").notNull(),
  wastageQty: real("wastage_qty").notNull(),
  wastagePercent: real("wastage_percent").notNull(),
  batchNumber: text("batch_number").notNull().unique(),
  notes: text("notes"),
});

export const finishedGoodsBatches = sqliteTable("finished_goods_batches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  batchNumber: text("batch_number").notNull().unique(),
  processingRecordId: integer("processing_record_id").notNull(),
  productNameLabel: text("product_name_label").notNull(),
  finalPowderQty: real("final_powder_qty").notNull(),
  remainingQty: real("remaining_qty").notNull(),
  processingCost: real("processing_cost").default(0),
  createdAt: text("created_at").notNull(),
});

export const packagingRecords = sqliteTable("packaging_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  finishedGoodsBatchId: integer("finished_goods_batch_id").notNull(),
  productId: integer("product_id").notNull(),
  packagingDate: text("packaging_date").notNull(),
  packSizeGrams: integer("pack_size_grams").notNull(), // 50,100,150,200,250,500,1000
  packetsProduced: integer("packets_produced").notNull(),
  powderUsedQty: real("powder_used_qty").notNull(),
});

// ---------------------------------------------------------------------------
// ADMIN / SETTINGS
// ---------------------------------------------------------------------------
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
