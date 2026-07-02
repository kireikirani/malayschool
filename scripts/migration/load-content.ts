import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { publicContent, publicContentItems, unitSectionItems, unitSections } from "@/db/schema";
import { getMigrationConfig } from "./config";
import type { LegacyPayload } from "./types";
import { getTransformedPayloadPath, logDryRun, readJsonFile } from "./utils";

export const CONTENT_ORDER = [
  "site page sections",
  "site page section items",
  "unit sections",
  "unit section items",
] as const;

export function summarizeContentCounts(payload: LegacyPayload) {
  return {
    publicContent: payload.publicContent.length,
    publicContentItems: payload.publicContent.reduce((total, section) => total + section.items.length, 0),
    unitSections: payload.unitSections.length,
    unitSectionItems: payload.unitSections.reduce((total, section) => total + section.items.length, 0),
  };
}

export async function loadContent(payload: LegacyPayload, dryRun = false) {
  if (dryRun) {
    logDryRun("content-counts", summarizeContentCounts(payload));
    return;
  }

  for (const bundle of payload.publicContent) {
    const [existing] = await db
      .select({ id: publicContent.id })
      .from(publicContent)
      .where(and(eq(publicContent.pageKey, bundle.section.pageKey), eq(publicContent.sectionKey, bundle.section.sectionKey)))
      .limit(1);

    let contentId = existing?.id;

    if (!contentId) {
      const inserted = await db.insert(publicContent).values(bundle.section).$returningId();
      contentId = inserted[0]?.id;
    }

    if (!contentId) continue;

    if (bundle.items.length) {
      await db.insert(publicContentItems).values(bundle.items.map((item) => ({ ...item, contentId })));
    }
  }

  for (const bundle of payload.unitSections) {
    const [existing] = await db
      .select({ id: unitSections.id })
      .from(unitSections)
      .where(and(eq(unitSections.unitSlug, bundle.section.unitSlug), eq(unitSections.sectionKey, bundle.section.sectionKey)))
      .limit(1);

    let sectionId = existing?.id;

    if (!sectionId) {
      const inserted = await db.insert(unitSections).values(bundle.section).$returningId();
      sectionId = inserted[0]?.id;
    }

    if (!sectionId) continue;

    if (bundle.items.length) {
      await db.insert(unitSectionItems).values(bundle.items.map((item) => ({ ...item, sectionId })));
    }
  }
}

async function main() {
  const config = getMigrationConfig();
  const payload = await readJsonFile<LegacyPayload>(getTransformedPayloadPath());
  await loadContent(payload, config.dryRun);
  console.log(`${config.dryRun ? "Previewed" : "Loaded"} structured content imports`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
