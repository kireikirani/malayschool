import type { LegacyPayload } from "./types";
import { getTransformedPayloadPath, readJsonFile } from "./utils";

export type VerificationInput = {
  duplicateSlugs: string[];
  missingMedia: string[];
  orphanedRelations?: string[];
  countMismatches?: string[];
};

export function buildVerificationSummary(input: VerificationInput) {
  const errors = [
    ...input.missingMedia.map((item) => `Missing media: ${item}`),
    ...input.duplicateSlugs.map((item) => `Duplicate slug: ${item}`),
    ...(input.orphanedRelations ?? []).map((item) => `Orphaned relation: ${item}`),
    ...(input.countMismatches ?? []).map((item) => `Count mismatch: ${item}`),
  ];

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function collectDuplicateNewsSlugs(payload: LegacyPayload) {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const row of payload.news) {
    if (seen.has(row.slug)) {
      duplicates.push(`news/${row.slug}`);
      continue;
    }

    seen.add(row.slug);
  }

  return duplicates;
}

export function collectMissingMedia(payload: LegacyPayload) {
  return payload.media
    .filter((row) => !row.filePath || !row.fileKey)
    .map((row) => row.id);
}

async function main() {
  const payload = await readJsonFile<LegacyPayload>(getTransformedPayloadPath());
  const summary = buildVerificationSummary({
    duplicateSlugs: collectDuplicateNewsSlugs(payload),
    missingMedia: collectMissingMedia(payload),
  });

  console.log(JSON.stringify(summary, null, 2));

  if (!summary.ok) {
    process.exitCode = 1;
  }
}

if (typeof process !== "undefined" && !process.env.VITEST) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
