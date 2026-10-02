// One-time move of the OLD website data (SQLite file data/aura.db + photos in data/uploads)
// into the PostgreSQL database.
//
// Run it once, from the Coolify terminal of the NEW deployment:
//   node scripts/import-from-sqlite.mjs /app/data/aura.db      (old file still on disk)
//   node scripts/import-from-sqlite.mjs --from-backup          (file was backed up into
//        PostgreSQL table "legacy_backup" from the old container before redeploying)
//
// It REPLACES the catalog, orders, reviews, inventory and admin account in PostgreSQL with
// the ones from the SQLite file (so your existing admin password keeps working), copies all
// settings, and copies uploaded photos into the database. Website content added in the new
// admin pages (FAQ, blog, policies, messages) is left untouched.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import os from "node:os";
import Database from "better-sqlite3";

if (!process.env.DATABASE_URL) { console.error("DATABASE_URL is not set."); process.exit(1); }
const ssl = /sslmode=require/.test(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : undefined;

let sqlitePath = process.argv[2] || path.join(process.cwd(), "data", "aura.db");
let uploadsDir = process.argv[3] || path.join(path.dirname(sqlitePath), "uploads");

if (process.argv[2] === "--from-backup") {
  // Unpack the backup rows (aura.db + uploads/<file>) into a temporary folder.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aura-backup-"));
  fs.mkdirSync(path.join(dir, "uploads"));
  const backup = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl });
  await backup.connect();
  const exists = (await backup.query("SELECT to_regclass('legacy_backup') AS t")).rows[0].t;
  if (!exists) { console.error("No backup found (table legacy_backup does not exist)."); process.exit(1); }
  for (const { name, data } of (await backup.query("SELECT name, data FROM legacy_backup")).rows) {
    if (name === "aura.db") fs.writeFileSync(path.join(dir, "aura.db"), data);
    else if (name.startsWith("uploads/") && /^[\w-]+\.(jpe?g|png|webp)$/i.test(name.slice(8))) fs.writeFileSync(path.join(dir, "uploads", name.slice(8)), data);
  }
  await backup.end();
  sqlitePath = path.join(dir, "aura.db");
  uploadsDir = path.join(dir, "uploads");
  console.log("Using the backup saved in PostgreSQL.");
}
if (!fs.existsSync(sqlitePath)) { console.error(`SQLite file not found: ${sqlitePath}`); process.exit(1); }

const TABLES = [
  "categories", "products", "bundles", "bundle_items", "orders", "order_items", "reviews",
  "suppliers", "raw_materials", "raw_material_purchases", "processing_records",
  "finished_goods_batches", "packaging_records", "admin_users",
];

const sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });
const sqliteTables = new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name));
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl });
await client.connect();

const pgColumns = async (table) =>
  new Set((await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table])).rows.map((r) => r.column_name));

try {
  await client.query("BEGIN");
  const present = TABLES.filter((t) => sqliteTables.has(t));
  await client.query(`TRUNCATE ${present.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY`);

  for (const table of present) {
    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
    const target = await pgColumns(table);
    for (const row of rows) {
      const cols = Object.keys(row).filter((c) => target.has(c));
      const values = cols.map((c) => row[c]);
      await client.query(
        `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")})`,
        values,
      );
    }
    if (target.has("id")) {
      await client.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM "${table}"), 1), (SELECT COUNT(*) > 0 FROM "${table}"))`);
    }
    console.log(`  ${table}: ${rows.length} rows`);
  }

  if (sqliteTables.has("settings")) {
    const rows = sqlite.prepare("SELECT key, value FROM settings").all();
    for (const { key, value } of rows) {
      await client.query("INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [key, value]);
    }
    console.log(`  settings: ${rows.length} values`);
  }
  await client.query("INSERT INTO settings (key, value) VALUES ('seeded_catalog_v1', $1) ON CONFLICT (key) DO NOTHING", [new Date().toISOString()]);

  let photos = 0;
  if (fs.existsSync(uploadsDir)) {
    const types = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    for (const name of fs.readdirSync(uploadsDir)) {
      const ext = name.split(".").pop().toLowerCase();
      if (!types[ext] || !/^[\w-]+\.(jpe?g|png|webp)$/i.test(name)) continue;
      const data = fs.readFileSync(path.join(uploadsDir, name));
      const res = await client.query(
        "INSERT INTO media (name, mime_type, size, data, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING",
        [name, types[ext], data.length, data, new Date().toISOString()],
      );
      photos += res.rowCount;
    }
  }
  console.log(`  uploaded photos: ${photos}`);

  await client.query("COMMIT");
  console.log("Done. Your old data is now in PostgreSQL.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Import failed — nothing was changed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
  sqlite.close();
}
