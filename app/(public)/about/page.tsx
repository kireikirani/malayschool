import { SCHOOL_MISSION, SCHOOL_NAME, SCHOOL_VISION } from "@/lib/brand";
import { PageHeader } from "@/components/public/page-header";

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Profil Sekolah"
        title={`Tentang ${SCHOOL_NAME}`}
        description="Teguh komited dalam usaha melahirkan modal insan yang cemerlang dari aspek akademik, sahsiah terpuji, dan kokurikulum selaras dengan Falsafah Pendidikan Kebangsaan."
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:py-14">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 border border-border/70 bg-card p-6">
            <h2 className="font-heading text-lg font-medium text-primary">Visi</h2>
            <p className="text-sm text-muted-foreground">&ldquo;{SCHOOL_VISION}&rdquo;</p>
          </div>
          <div className="space-y-2 border border-border/70 bg-card p-6">
            <h2 className="font-heading text-lg font-medium text-primary">Misi</h2>
            <p className="text-sm text-muted-foreground">&ldquo;{SCHOOL_MISSION}&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
