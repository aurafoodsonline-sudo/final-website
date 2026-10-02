# Deploying on Coolify (PostgreSQL)

All website data now lives in PostgreSQL: products, categories, bundles, orders, reviews,
inventory, admin account, settings (business details, social links, delivery charges),
website content (FAQ, testimonials, blog, policy pages, website text), uploaded photos and
contact/support messages. Nothing is stored inside the app container any more, so redeploys
never lose data.

## 1. Environment variables (Coolify → app → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Coolify → your PostgreSQL resource → copy **Postgres URL (internal)** |
| `SESSION_SECRET` | any long random text (keeps admins logged in across restarts) |
| `ADMIN_PASSWORD` | optional — password for the first admin account on an empty database |

The app and the database must be on the same Coolify server/network for the internal URL
to work (they are when both were created in the same project/environment).

## 2. Deploy

Push to `main` (or press **Redeploy**). On start, the app creates all tables automatically
(SQL files in `/drizzle`) and fills an empty database with the starter catalog and content.
Check the app logs for `[setup] Database ready.`

## 3. Bring over data from the old SQLite version (one time)

**Before** the PostgreSQL version deploys, back up the old data from the OLD app's Coolify
Terminal (it saves the data file and uploaded photos into a `legacy_backup` table in
PostgreSQL). Replace `PASTE_URL` with the database's connection string:

```
cd /tmp && npm i pg@8 --no-save --silent && DATABASE_URL='PASTE_URL' node -e 'const fs=require("fs"),{Client}=require("pg"),D=require("/app/node_modules/better-sqlite3");(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();await c.query("CREATE TABLE IF NOT EXISTS legacy_backup(name text PRIMARY KEY, data bytea NOT NULL)");const put=(n,b)=>c.query("INSERT INTO legacy_backup(name,data) VALUES($1,$2) ON CONFLICT(name) DO UPDATE SET data=EXCLUDED.data",[n,b]);const db=new D("/app/data/aura.db");await put("aura.db",db.serialize());const u="/app/data/uploads";let n=0;if(fs.existsSync(u))for(const f of fs.readdirSync(u)){await put("uploads/"+f,fs.readFileSync(u+"/"+f));n++}console.log("BACKUP OK: "+db.prepare("SELECT COUNT(*) AS c FROM orders").get().c+" orders, "+n+" photos saved to PostgreSQL.");await c.end()})().catch(e=>{console.error("BACKUP FAILED: "+e.message);process.exit(1)})'
```

After the new version is running, restore it from the NEW app's Terminal:

```
node scripts/import-from-sqlite.mjs --from-backup
```

(If the old `/app/data` folder was on a persistent volume, you can instead run
`node scripts/import-from-sqlite.mjs /app/data/aura.db`.)

This replaces the catalog, orders, reviews, inventory and admin account in PostgreSQL with
the old ones (your old admin password keeps working), copies settings, and moves photos into
the database. FAQ/blog/policy content and messages are untouched.

## 4. After the first deploy

- Log in at `/admin` (default `admin` / `AuraAdmin@2026` unless `ADMIN_PASSWORD` was set)
  and change the password in **Settings & Delivery**.
- **Settings & Delivery**: business details, WhatsApp number, social links (footer icons),
  delivery charge and free-delivery amount.
- **Website Content**: FAQ, blog, testimonials, home "Why Aura Foods", About values.
- **Policy Pages** and **Website Text**: page wording in English and Urdu.
- **Messages**: everything sent from the Contact and Support forms.

## Changing the database structure later

Edit `src/db/schema.ts`, run `npm run db:generate` (needs `DATABASE_URL`), commit the new
file in `/drizzle`. It is applied automatically on the next start.
