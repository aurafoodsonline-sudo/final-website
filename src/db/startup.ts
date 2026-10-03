import { setupDatabase } from "./setup";

export async function setupOnStart() {
  if (!process.env.DATABASE_URL) {
    console.error("[setup] DATABASE_URL is not set — the website cannot reach its database.");
    return;
  }
  try {
    await setupDatabase();
    console.log("[setup] Database ready.");
  } catch (error) {
    console.error("[setup] Database setup failed:", error);
  }
}
