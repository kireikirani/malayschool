import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { getMigrationConfig } from "./config";
import type { LegacyPayload } from "./types";
import { fileKeyFromPath, fileNameFromPath, getTransformedPayloadPath, logDryRun, normalizeMediaFolder, normalizeMediaPath, readJsonFile } from "./utils";

export async function loadMedia(rows: LegacyPayload["media"], dryRun = false) {
  for (const row of rows) {
    const normalized = {
      ...row,
      fileName: row.fileName?.trim() || fileNameFromPath(row.filePath),
      filePath: normalizeMediaPath(row.filePath),
      fileKey: row.fileKey?.trim() || fileKeyFromPath(row.filePath),
      folder: normalizeMediaFolder(row.folder),
    };

    if (dryRun) {
      logDryRun("media", normalized);
      continue;
    }

    await db.insert(media).values(normalized).onDuplicateKeyUpdate({
      set: {
        fileName: normalized.fileName,
        filePath: normalized.filePath,
        fileKey: normalized.fileKey,
        fileType: normalized.fileType,
        fileSize: normalized.fileSize,
        folder: normalized.folder,
        uploadedBy: normalized.uploadedBy,
      },
    });
  }
}

async function main() {
  const config = getMigrationConfig();
  const payload = await readJsonFile<LegacyPayload>(getTransformedPayloadPath());
  await loadMedia(payload.media, config.dryRun);
  console.log(`${config.dryRun ? "Previewed" : "Loaded"} ${payload.media.length} media rows`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
