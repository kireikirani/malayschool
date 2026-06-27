import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  // TiDB Cloud (dan MySQL serverless) membutuhkan SSL.
  // Jika DATABASE_URL sudah mengandung ?ssl=... maka ini diabaikan otomatis.
  ssl: process.env.DATABASE_URL?.includes("tidbcloud.com")
    ? { rejectUnauthorized: true }
    : undefined,
  // Batasi jumlah koneksi agar tidak melebihi limit free tier
  connectionLimit: 5,
  // Tutup koneksi idle agar tidak buang resource di serverless
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const db = drizzle(pool, { schema, mode: "default" });
