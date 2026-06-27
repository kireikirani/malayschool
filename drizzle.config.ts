import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: new URL(process.env.DATABASE_URL!.replace("?ssl=true", "")).hostname,
    port: Number(new URL(process.env.DATABASE_URL!.replace("?ssl=true", "")).port) || 4000,
    user: new URL(process.env.DATABASE_URL!.replace("?ssl=true", "")).username,
    password: new URL(process.env.DATABASE_URL!.replace("?ssl=true", "")).password,
    database: new URL(process.env.DATABASE_URL!.replace("?ssl=true", "")).pathname.slice(1),
    ssl: process.env.DATABASE_URL?.includes("tidbcloud.com")
      ? { rejectUnauthorized: true }
      : undefined,
  },
  strict: true,
  verbose: true,
});
