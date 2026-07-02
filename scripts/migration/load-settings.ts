import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";
import { getMigrationConfig } from "./config";
import type { LegacyPayload } from "./types";
import { getTransformedPayloadPath, logDryRun, readJsonFile } from "./utils";

export async function loadSettings(rows: LegacyPayload["settings"], dryRun = false) {
  for (const row of rows) {
    if (dryRun) {
      logDryRun("site_settings", row);
      continue;
    }

    await db.insert(siteSettings).values(row).onDuplicateKeyUpdate({
      set: { value: row.value },
    });
  }
}

async function main() {
  const config = getMigrationConfig();
  const payload = await readJsonFile<LegacyPayload>(getTransformedPayloadPath());
  await loadSettings(payload.settings, config.dryRun);
  console.log(`${config.dryRun ? "Previewed" : "Loaded"} ${payload.settings.length} site settings`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
