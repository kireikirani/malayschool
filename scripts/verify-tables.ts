import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  const tables = ["asrama_wardens", "asrama_fasiliti", "unit_jk_members"];
  for (const table of tables) {
    const result = await db.execute(sql`SELECT COUNT(*) as total FROM \`${sql.raw(table)}\``);
    const raw = result as unknown;
    const rows = Array.isArray(raw) ? raw[0] : (raw as Record<string, unknown>).rows ?? raw;
    const firstRow = Array.isArray(rows) ? rows[0] : rows;
    const total = firstRow ? Object.values(firstRow as Record<string, unknown>)[0] : "?";
    console.log(`✓ ${table}: ${total} baris`);
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
