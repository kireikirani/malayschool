import { ContentSectionForm } from "@/components/admin/content-section-form";
import { UNITS } from "@/lib/units";

type PageProps = {
  searchParams: Promise<{ unitSlug?: string }>;
};

export default async function NewUnitSectionPage({ searchParams }: PageProps) {
  const { unitSlug } = await searchParams;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Tambah Unit Section</h1>
        <p className="text-sm text-muted-foreground">Tambah seksyen tersusun untuk halaman unit.</p>
      </div>
      <ContentSectionForm
        mode="unit"
        action="create"
        redirectTo="/admin/units"
        unitOptions={UNITS.map((unit) => ({ value: unit.slug, label: unit.navLabel }))}
        initialValue={unitSlug ? { unitSlug } : undefined}
      />
    </div>
  );
}
