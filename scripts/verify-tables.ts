import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  const tables = ["asrama_wardens", "asrama_fasiliti", "unit_jk_members"];
  for (const table of tables) {
    const result = await db.execute(sql`SELECT COUNT(*) as total FROM \`${sql.raw(table)}\``);
    // TiDB returns rows as first element of result array
    const rows = Array.isArray(result) ? result[0] : result.rows ?? result;
    const firstRow = Array.isArray(rows) ? rows[0] : rows;
    const total = firstRow ? Object.values(firstRow as Record<string, unknown>)[0] : "?";
    console.log(`✓ ${table}: ${total} baris`);
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
