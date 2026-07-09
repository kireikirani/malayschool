import type { LegacyPayload } from "./types";
import { getRawPayloadPath, getTransformedPayloadPath, makeDeterministicSlug, normalizeMediaFolder, normalizeMediaPath, normalizeOptionalText, readJsonFile, writeJsonFile } from "./utils";

export function transformLegacyPayload(input: LegacyPayload): LegacyPayload {
  return {
    ...input,
    settings: (input.settings ?? []).map((row) => ({
      key: row.key.trim(),
      value: row.value.trim(),
    })),
    users: (input.users ?? []).map((row) => ({
      ...row,
      name: row.name.trim(),
      email: row.email.trim().toLowerCase(),
      image: normalizeOptionalText(row.image) ?? undefined,
    })),
    media: (input.media ?? []).map((row) => {
      const filePath = normalizeMediaPath(row.filePath);
      return {
        ...row,
        filePath,
        fileKey: row.fileKey?.trim() || filePath.replace(/^\/+/, ""),
        folder: normalizeMediaFolder(row.folder),
        fileType: normalizeOptionalText(row.fileType) ?? undefined,
      };
    }),
    teachers: input.teachers ?? [],
    advertisements: input.advertisements ?? [],
    pengumuman: input.pengumuman ?? [],
    news: (input.news ?? []).map((row) => ({
      ...row,
      title: row.title.trim(),
      slug: makeDeterministicSlug(row.slug, "news", row.id),
      metaTitle: normalizeOptionalText(row.metaTitle) ?? undefined,
      metaDescription: normalizeOptionalText(row.metaDescription) ?? undefined,
      thumbnail: normalizeOptionalText(row.thumbnail) ?? undefined,
      ogImage: normalizeOptionalText(row.ogImage) ?? undefined,
    })),
    gallery: input.gallery ?? [],
    asrama: input.asrama ?? [],
    unitDocuments: input.unitDocuments ?? [],
    publicContent: input.publicContent ?? [],
    unitSections: input.unitSections ?? [],
  };
}

async function main() {
  const raw = await readJsonFile<LegacyPayload>(getRawPayloadPath());
  const transformed = transformLegacyPayload(raw);
  const targetPath = getTransformedPayloadPath();
  await writeJsonFile(targetPath, transformed);
  console.log(`Wrote ${targetPath}`);
}

if (typeof process !== "undefined" && !process.env.VITEST) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
