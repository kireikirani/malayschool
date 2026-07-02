import { mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "scripts", "migration", ".data");

export type MigrationConfig = {
  baseUrl: string;
  dataDir: string;
  dryRun: boolean;
};

export function getMigrationConfig(): MigrationConfig {
  return {
    baseUrl: process.env.MIGRATION_BASE_URL ?? "http://127.0.0.1:3000",
    dataDir: DATA_DIR,
    dryRun: process.argv.includes("--dry-run"),
  };
}

export async function ensureMigrationDataDir(config = getMigrationConfig()) {
  await mkdir(config.dataDir, { recursive: true });
  return config.dataDir;
}
