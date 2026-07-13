import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import mysql from "mysql2/promise";

const journal = JSON.parse(readFileSync(join("drizzle", "meta", "_journal.json"), "utf8"));

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({
    uri: url,
    ssl: url.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  });

  const [existing] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT hash FROM __drizzle_migrations",
  );
  const known = new Set(existing.map((r) => r.hash));

  for (const entry of journal.entries) {
    const sql = readFileSync(join("drizzle", `${entry.tag}.sql`), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);
    const hash = createHash("sha256").update(statements.join("")).digest("hex");
    if (known.has(hash)) {
      console.log("skip (already seeded):", entry.tag);
      continue;
    }
    await conn.query("INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)", [
      hash,
      entry.when,
    ]);
    console.log("seeded:", entry.tag);
  }

  await conn.end();
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
