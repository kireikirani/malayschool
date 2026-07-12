export const dynamic = "force-dynamic";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitDocuments } from "@/db/schema";
import { PageHeader } from "@/components/public/page-header";
import { ASRAMA_DOCUMENT_CATEGORIES, UNITS } from "@/lib/units";
import { BorangClient } from "@/components/public/borang-client";

export default async function BorangPage() {
  const uploadedUnitDocs = await db
    .select()
    .from(unitDocuments)
    .where(eq(unitDocuments.type, "dokumen"))
    .orderBy(asc(unitDocuments.unitSlug), asc(unitDocuments.sortOrder));

  const unitsMeta = UNITS.map((u) => ({ slug: u.slug, navLabel: u.navLabel }));

  return (
    <div>
      <PageHeader
        eyebrow="Sistem Informasi & Hebahan"
        title="Borang & Dokumentasi Asrama"
        description="Akses terus dokumen pengurusan asrama, dokumen unit, dan fail rasmi sekolah."
      />
      <BorangClient
        categories={ASRAMA_DOCUMENT_CATEGORIES}
        uploadedUnitDocs={uploadedUnitDocs.map((d) => ({
          id: d.id,
          unitSlug: d.unitSlug,
          label: d.label,
          fileUrl: d.fileUrl,
        }))}
        units={unitsMeta}
      />
    </div>
  );
}

