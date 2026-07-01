import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { getPublicContent } from "@/lib/content";
import { getSettings } from "@/lib/site-settings";

export default async function AboutPage() {
  const [settings, sections] = await Promise.all([getSettings(), getPublicContent("about")]);

  return (
    <div>
      <PageHeader
        eyebrow="Profil Sekolah"
        title={`Tentang ${settings.schoolName}`}
        description="Teguh komited dalam usaha melahirkan modal insan yang cemerlang dari aspek akademik, sahsiah terpuji, dan kokurikulum selaras dengan Falsafah Pendidikan Kebangsaan."
      />

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 md:py-16">
        <section>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 border border-border/70 bg-card p-6">
              <h2 className="font-heading text-lg font-medium text-primary">Visi</h2>
              <p className="text-sm text-muted-foreground">&ldquo;{settings.schoolVision}&rdquo;</p>
            </div>
            <div className="space-y-2 border border-border/70 bg-card p-6">
              <h2 className="font-heading text-lg font-medium text-primary">Misi</h2>
              <p className="text-sm text-muted-foreground">&ldquo;{settings.schoolMission}&rdquo;</p>
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
        ))}
      </div>
    </div>
  );
}
