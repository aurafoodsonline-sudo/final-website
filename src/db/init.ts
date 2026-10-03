import type Database from "better-sqlite3";

// Idempotent raw-SQL schema creation (kept in lockstep with schema.ts).
// Called automatically from db/index.ts, so every page (storefront or admin) always has the
// full schema — even on a brand-new or older database file.
export function ensureSchema(sqlite: Database.Database) {
sqlite.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ur TEXT NOT NULL,
  image TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL,
  name_en TEXT NOT NULL,
  name_ur TEXT NOT NULL,
  tagline_en TEXT,
  tagline_ur TEXT,
  description_en TEXT,
  description_ur TEXT,
  ingredients_en TEXT,
  ingredients_ur TEXT,
  usage_en TEXT,
  usage_ur TEXT,
  weight_label TEXT NOT NULL,
  grammage_options TEXT,
  price REAL NOT NULL,
  old_price REAL,
  image TEXT,
  best_seller INTEGER DEFAULT 0,
  new_arrival INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  wholesale_eligible INTEGER DEFAULT 1,
  wholesale_price REAL,
  website_stock_status TEXT NOT NULL DEFAULT 'available',
  website_stock_qty INTEGER,
  is_hidden INTEGER DEFAULT 0,
  internal_stock_qty INTEGER DEFAULT 0,
  meta_title_en TEXT,
  meta_title_ur TEXT,
  meta_description_en TEXT,
  meta_description_ur TEXT,
  canonical_url TEXT,
  no_index INTEGER DEFAULT 0,
  image_alt_en TEXT,
  image_alt_ur TEXT
);

CREATE TABLE IF NOT EXISTS bundles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ur TEXT NOT NULL,
  description_en TEXT,
  description_ur TEXT,
  price REAL NOT NULL,
  old_price REAL,
  image TEXT,
  website_stock_status TEXT NOT NULL DEFAULT 'available',
  is_hidden INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  city TEXT,
  subtotal REAL NOT NULL,
  discount REAL DEFAULT 0,
  delivery_charges REAL DEFAULT 0,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  payment_date TEXT,
  order_status TEXT NOT NULL DEFAULT 'pending',
  whatsapp_confirmation_status TEXT NOT NULL DEFAULT 'not_sent',
  whatsapp_sent_at TEXT,
  whatsapp_responded_at TEXT,
  notes TEXT,
  entered_by_admin_id INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER,
  product_name_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  packaging_record_id INTEGER,
  bundle_id INTEGER
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL,
  body TEXT NOT NULL,
  verified_order_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT,
  address TEXT,
  supplied_materials TEXT,
  payment_type TEXT DEFAULT 'cash',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL DEFAULT 'kg',
  stock_qty REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS raw_material_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supplier_id INTEGER NOT NULL,
  raw_material_id INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  purchase_rate REAL NOT NULL,
  total_cost REAL NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'cash',
  paid_amount REAL NOT NULL DEFAULT 0,
  remaining_amount REAL NOT NULL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS processing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_material_id INTEGER NOT NULL,
  purchase_ref_id INTEGER,
  supplier_id INTEGER,
  processing_date TEXT NOT NULL,
  qty_sent REAL NOT NULL,
  processing_cost REAL DEFAULT 0,
  processor TEXT,
  expected_output REAL,
  actual_output REAL NOT NULL,
  wastage_qty REAL NOT NULL,
  wastage_percent REAL NOT NULL,
  batch_number TEXT NOT NULL UNIQUE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS finished_goods_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_number TEXT NOT NULL UNIQUE,
  processing_record_id INTEGER NOT NULL,
  product_name_label TEXT NOT NULL,
  final_powder_qty REAL NOT NULL,
  remaining_qty REAL NOT NULL,
  processing_cost REAL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS packaging_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finished_goods_batch_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  packaging_date TEXT NOT NULL,
  pack_size_grams INTEGER NOT NULL,
  packets_produced INTEGER NOT NULL,
  powder_used_qty REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

function addColumnIfMissing(table: string, column: string, type: string) {
  const columns = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((c) => c.name === column)) sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}
addColumnIfMissing("order_items", "bundle_id", "INTEGER");
addColumnIfMissing("products", "grammage_options", "TEXT");

// Default settings rows so the admin Settings page always has something to update.
const insertSetting = sqlite.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
insertSetting.run("whatsapp_automation_enabled", "true");
insertSetting.run("whatsapp_template", "Hi {{customer_name}}, thank you for your order #{{order_number}} from Aura Foods!");
}
