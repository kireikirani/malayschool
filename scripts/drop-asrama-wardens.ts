import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  console.log("Dropping asrama_wardens table...");
  try {
    await db.execute(sql.raw("DROP TABLE IF EXISTS `asrama_wardens`;"));
    console.log("[OK] Dropped asrama_wardens");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[WARN]", msg);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
