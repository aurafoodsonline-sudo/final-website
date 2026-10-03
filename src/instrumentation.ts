// Runs once when the server starts (not during `next build`): creates/updates the database
// tables and fills an empty database with starter content.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setupOnStart } = await import("./db/startup");
    await setupOnStart();
  }
}
