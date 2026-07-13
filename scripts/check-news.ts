import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({
    uri: url,
    ssl: url.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  });
  const [rows] = await conn.query("SELECT id, slug FROM news");
  console.log("news rows:", rows);
  const [dup] = await conn.query("SELECT slug, COUNT(*) c FROM news GROUP BY slug HAVING c > 1");
  console.log("duplicate slugs:", dup);
  await conn.end();
  process.exit(0);
}
main();
