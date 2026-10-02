// `npm run seed` — creates the tables and adds starter content to an empty database.
import { setupDatabase } from "./setup";
import { getPool } from "./index";

setupDatabase()
  .then(async () => { console.log("Database is set up."); await getPool().end(); })
  .catch((e) => { console.error(e); process.exit(1); });
