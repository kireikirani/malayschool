import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({
    uri: url,
    ssl: url.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  });
  const db = drizzle(conn);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
  await conn.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
