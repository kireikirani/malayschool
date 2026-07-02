import path from "node:path";
import { ensureMigrationDataDir, getMigrationConfig } from "./config";
import type { LegacyPayload } from "./types";
import { writeJsonFile } from "./utils";

async function main() {
  const config = getMigrationConfig();
  await ensureMigrationDataDir(config);

  const payload: LegacyPayload = {
    exportedAt: new Date().toISOString(),
    settings: [],
    users: [],
    media: [],
    teachers: [],
    advertisements: [],
    pengumuman: [],
    news: [],
    gallery: [],
    asrama: [],
    unitDocuments: [],
    publicContent: [],
    unitSections: [],
  };

  const targetPath = path.join(config.dataDir, "legacy-raw.json");
  await writeJsonFile(targetPath, payload);

  if (config.dryRun) {
    console.log(`[dry-run] wrote extraction template to ${targetPath}`);
    return;
  }

  console.log(`Wrote ${targetPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
