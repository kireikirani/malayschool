import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { unitSections, unitSectionItems } from "../db/schema";
import { getUnitSections } from "../lib/content";
import { UNITS } from "../lib/units";

function normalizeSectionKey(section: {
  type: string;
  sectionKey: string;
  jkCode?: string | null;
}) {
  if (section.type === "jk_table" && section.jkCode) {
    return `jk-${section.jkCode}`;
  }
  return section.sectionKey;
}

async function migrateUnit(unitSlug: string) {
  const defaults = await getUnitSections(unitSlug);
  if (!defaults.length) {
    console.log(`  (no defaults)`);
    return { inserted: 0, skipped: 0 };
  }

  let inserted = 0;
  let skipped = 0;

  for (const section of defaults) {
    const sectionKey = normalizeSectionKey(section);

    const [existing] = await db
      .select({ id: unitSections.id })
      .from(unitSections)
      .where(and(eq(unitSections.unitSlug, unitSlug), eq(unitSections.sectionKey, sectionKey)))
      .limit(1);

    if (existing) {
      skipped++;
      continue;
    }

    const [result] = await db.insert(unitSections).values({
      unitSlug,
      sectionKey,
      type: section.type,
      title: section.title ?? null,
      subtitle: section.subtitle ?? null,
      body: section.body ?? null,
      imageUrl: section.imageUrl ?? null,
      linkLabel: section.linkLabel ?? null,
      linkUrl: section.linkUrl ?? null,
      isActive: section.isActive,
      sortOrder: section.sortOrder,
    });

    const sectionId = result.insertId;

    if (section.items?.length) {
      await db.insert(unitSectionItems).values(
        section.items.map((item, index) => ({
          sectionId,
          label: item.label ?? null,
          title: item.title ?? null,
          value: item.value ?? null,
          body: item.body ?? null,
          url: item.url ?? null,
          fileUrl: item.fileUrl ?? null,
          imageUrl: item.imageUrl ?? null,
          metaJson: null,
          sortOrder: item.sortOrder ?? index,
        })),
      );
    }

    inserted++;
    console.log(`  + [${section.sortOrder}] ${section.type} key=${sectionKey} items=${section.items?.length ?? 0}`);
  }

  return { inserted, skipped };
}

async function main() {
  let totalInserted = 0;
  let totalSkipped = 0;
  for (const unit of UNITS) {
    console.log(`\n=== ${unit.slug} (${unit.title}) ===`);
    const { inserted, skipped } = await migrateUnit(unit.slug);
    totalInserted += inserted;
    totalSkipped += skipped;
  }
  console.log(`\n---\nDONE. Inserted: ${totalInserted}, Skipped (already existed): ${totalSkipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
