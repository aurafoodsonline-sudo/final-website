import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// All website data lives in PostgreSQL. Set DATABASE_URL in Coolify to the database's
// connection string, e.g. postgres://user:password@host:5432/dbname
// The pool is created lazily so `next build` never needs a database connection.
type Db = NodePgDatabase<typeof schema>;
const globalForDb = globalThis as unknown as { auraPool?: Pool; auraDb?: Db };

function getDb(): Db {
  if (!globalForDb.auraDb) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set. Add your PostgreSQL connection string to the environment variables.");
    const ssl = /sslmode=require/.test(connectionString) || process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined;
    globalForDb.auraPool = new Pool({ connectionString, ssl, max: Number(process.env.DATABASE_POOL_SIZE ?? 10) });
    globalForDb.auraDb = drizzle(globalForDb.auraPool, { schema });
  }
  return globalForDb.auraDb;
}

export function getPool(): Pool {
  getDb();
  return globalForDb.auraPool!;
}

// `db` behaves exactly like a Drizzle database, but only connects on first use.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});
