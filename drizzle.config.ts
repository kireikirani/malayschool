import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in DATABASE_URL before running Drizzle commands.",
  );
}

const normalizedUrl = databaseUrl.replace("?ssl=true", "");
const parsedUrl = new URL(normalizedUrl);

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port) || 4000,
    user: parsedUrl.username,
    password: parsedUrl.password,
    database: parsedUrl.pathname.slice(1),
    ssl: databaseUrl.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  },
  strict: true,
  verbose: true,
});
