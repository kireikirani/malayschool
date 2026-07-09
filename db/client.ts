import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";
import * as schema from "./schema";

let databaseUrl = (process.env.DATABASE_URL || "").trim();

// Bersihkan pembungkus petikan (quotes) jika ada
if (databaseUrl.startsWith('"') && databaseUrl.endsWith('"')) {
  databaseUrl = databaseUrl.slice(1, -1).trim();
} else if (databaseUrl.startsWith("'") && databaseUrl.endsWith("'")) {
  databaseUrl = databaseUrl.slice(1, -1).trim();
}

if (!databaseUrl) {
  databaseUrl = "mysql://127.0.0.1:3306/dummy";
}

let pool: mysql.Pool;

try {
  // Sahkan format URL terlebih dahulu
  new URL(databaseUrl);

  pool = mysql.createPool({
    uri: databaseUrl,
    // TiDB Cloud (dan MySQL serverless) membutuhkan SSL.
    // Jika DATABASE_URL sudah mengandung ?ssl=... maka ini diabaikan otomatis.
    ssl: databaseUrl.includes("tidbcloud.com")
      ? { rejectUnauthorized: true }
      : undefined,
    // Batasi jumlah koneksi agar tidak melebihi limit free tier
    connectionLimit: 5,
    // Tutup koneksi idle agar tidak buang resource di serverless
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
} catch (e) {
  console.error("Format DATABASE_URL tidak sah atau tidak ditemui. Menggunakan fallback dummy URL untuk mengelakkan ralat pembinaan.", e);
  const fallbackUrl = "mysql://127.0.0.1:3306/dummy";
  pool = mysql.createPool({
    uri: fallbackUrl,
    ssl: undefined,
    connectionLimit: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

export const db = drizzle(pool, { schema, mode: "default" });
