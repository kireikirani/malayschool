import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({
    uri: url,
    ssl: url.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  });
  const [rows] = await conn.query("SHOW TABLES");
  console.log(rows);
  await conn.end();
  process.exit(0);
}
main();
