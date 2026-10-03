CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "bundle_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"bundle_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ur" text NOT NULL,
	"description_en" text,
	"description_ur" text,
	"price" double precision NOT NULL,
	"old_price" double precision,
	"image" text,
	"website_stock_status" text DEFAULT 'available' NOT NULL,
	"is_hidden" integer DEFAULT 0,
	CONSTRAINT "bundles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ur" text NOT NULL,
	"image" text,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"title_ur" text DEFAULT '' NOT NULL,
	"body_en" text DEFAULT '' NOT NULL,
	"body_ur" text DEFAULT '' NOT NULL,
	"extra_en" text,
	"extra_ur" text,
	"meta" text,
	"image" text,
	"is_hidden" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finished_goods_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_number" text NOT NULL,
	"processing_record_id" integer NOT NULL,
	"product_name_label" text NOT NULL,
	"final_powder_qty" double precision NOT NULL,
	"remaining_qty" double precision NOT NULL,
	"processing_cost" double precision DEFAULT 0,
	"created_at" text NOT NULL,
	CONSTRAINT "finished_goods_batches_batch_number_unique" UNIQUE("batch_number")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "media_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"category" text,
	"subject" text,
	"order_number" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_name_snapshot" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" double precision NOT NULL,
	"packaging_record_id" integer,
	"bundle_id" integer
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"source" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_email" text,
	"customer_address" text NOT NULL,
	"city" text,
	"subtotal" double precision NOT NULL,
	"discount" double precision DEFAULT 0,
	"delivery_charges" double precision DEFAULT 0,
	"total" double precision NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"payment_date" text,
	"order_status" text DEFAULT 'pending' NOT NULL,
	"whatsapp_confirmation_status" text DEFAULT 'not_sent' NOT NULL,
	"whatsapp_sent_at" text,
	"whatsapp_responded_at" text,
	"notes" text,
	"entered_by_admin_id" integer,
	"created_at" text NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "packaging_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"finished_goods_batch_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"packaging_date" text NOT NULL,
	"pack_size_grams" integer NOT NULL,
	"packets_produced" integer NOT NULL,
	"powder_used_qty" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"slug" text PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"title_ur" text NOT NULL,
	"body_en" text NOT NULL,
	"body_ur" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processing_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_material_id" integer NOT NULL,
	"purchase_ref_id" integer,
	"supplier_id" integer,
	"processing_date" text NOT NULL,
	"qty_sent" double precision NOT NULL,
	"processing_cost" double precision DEFAULT 0,
	"processor" text,
	"expected_output" double precision,
	"actual_output" double precision NOT NULL,
	"wastage_qty" double precision NOT NULL,
	"wastage_percent" double precision NOT NULL,
	"batch_number" text NOT NULL,
	"notes" text,
	CONSTRAINT "processing_records_batch_number_unique" UNIQUE("batch_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"sku" text NOT NULL,
	"category_id" integer NOT NULL,
	"name_en" text NOT NULL,
	"name_ur" text NOT NULL,
	"tagline_en" text,
	"tagline_ur" text,
	"description_en" text,
	"description_ur" text,
	"ingredients_en" text,
	"ingredients_ur" text,
	"usage_en" text,
	"usage_ur" text,
	"weight_label" text NOT NULL,
	"grammage_options" text,
	"price" double precision NOT NULL,
	"old_price" double precision,
	"image" text,
	"best_seller" integer DEFAULT 0,
	"new_arrival" integer DEFAULT 0,
	"featured" integer DEFAULT 0,
	"wholesale_eligible" integer DEFAULT 1,
	"wholesale_price" double precision,
	"website_stock_status" text DEFAULT 'available' NOT NULL,
	"website_stock_qty" integer,
	"is_hidden" integer DEFAULT 0,
	"internal_stock_qty" integer DEFAULT 0,
	"meta_title_en" text,
	"meta_title_ur" text,
	"meta_description_en" text,
	"meta_description_ur" text,
	"canonical_url" text,
	"no_index" integer DEFAULT 0,
	"image_alt_en" text,
	"image_alt_ur" text,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "raw_material_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"raw_material_id" integer NOT NULL,
	"purchase_date" text NOT NULL,
	"quantity" double precision NOT NULL,
	"unit" text NOT NULL,
	"purchase_rate" double precision NOT NULL,
	"total_cost" double precision NOT NULL,
	"payment_type" text DEFAULT 'cash' NOT NULL,
	"paid_amount" double precision DEFAULT 0 NOT NULL,
	"remaining_amount" double precision DEFAULT 0 NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "raw_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit" text DEFAULT 'kg' NOT NULL,
	"stock_qty" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "raw_materials_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"verified_order_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text,
	"address" text,
	"supplied_materials" text,
	"payment_type" text DEFAULT 'cash',
	"notes" text
);
