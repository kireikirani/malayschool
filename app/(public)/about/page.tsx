import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { VisionMission } from "@/components/public/home/vision-mission";
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

      <VisionMission vision={settings.schoolVision} mission={settings.schoolMission} />

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 md:py-16">
        {sections.map((section) => (
          <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
        ))}
      </div>
    </div>
  );
}
