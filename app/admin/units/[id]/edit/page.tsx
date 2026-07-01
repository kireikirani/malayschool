import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { unitSectionItems, unitSections } from "@/db/schema";
import { ContentSectionForm } from "@/components/admin/content-section-form";
import { UNITS } from "@/lib/units";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditUnitSectionPage({ params }: PageProps) {
  const { id } = await params;
  const sectionId = Number(id);
  const [row] = await db.select().from(unitSections).where(eq(unitSections.id, sectionId)).limit(1);
  if (!row) notFound();

  const items = await db.select().from(unitSectionItems).where(eq(unitSectionItems.sectionId, sectionId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Unit Section</h1>
        <p className="text-sm text-muted-foreground">Kemaskini seksyen unit dan item-itemnya.</p>
      </div>
      <ContentSectionForm
        mode="unit"
        action="edit"
        redirectTo="/admin/units"
        unitOptions={UNITS.map((unit) => ({ value: unit.slug, label: unit.navLabel }))}
        initialValue={{
          ...row,
          unitSlug: row.unitSlug,
          items: items.map((item) => ({
            id: item.id,
            label: item.label,
            title: item.title,
            value: item.value,
            body: item.body,
            url: item.url,
            fileUrl: item.fileUrl,
            imageUrl: item.imageUrl,
            meta: item.metaJson ? JSON.parse(item.metaJson) : null,
            sortOrder: item.sortOrder,
          })),
        }}
      />
    </div>
  );
}
