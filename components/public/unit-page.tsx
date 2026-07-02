import { Clock } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { UNIT_OPERATING_HOURS, type Unit } from "@/lib/units";
import { SCHOOL_NAME } from "@/lib/brand";
import { getUnitSections } from "@/lib/content";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export async function UnitPage({ unit }: { unit: Unit }) {
  const sections = await getUnitSections(unit.slug);

  return (
    <div>
      <PageHeader eyebrow={SCHOOL_NAME} title={unit.title} description={`${unit.headName} - ${unit.headPosition}`} />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:py-16">


        {/* CMS-managed content sections */}
        {sections.map((section) => (
          <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
        ))}

        {/* Pencapaian / Achievements */}
        {unit.pencapaian && unit.pencapaian.length > 0 && (
          <section>
            <ScrollAnimation direction="up">
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Pencapaian</span>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Pencapaian & Program</h2>
            </ScrollAnimation>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unit.pencapaian.map((item, i) => (
                <ScrollAnimation key={item.title} direction="up" delay={i * 0.06}>
                  <div className="border border-border/70 bg-card p-5">
                    <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </section>
        )}



        {/* Operating Hours */}
        <section className="grid gap-6 border border-border/70 bg-card px-6 py-8 sm:grid-cols-[1fr_1fr] md:px-10">
          <div>
            <h3 className="font-heading text-lg font-semibold">Maklumat Umum</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Semua pelajar tertakluk kepada Buku Peraturan Sekolah. Kehadiran adalah wajib dan pemakaian seragam sekolah hendaklah sentiasa kemas mengikut ketetapan Kementerian Pendidikan Malaysia.
            </p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Clock className="size-4 text-primary" />
              Waktu Operasi {unit.title}
            </h3>
            <dl className="mt-2 space-y-1 text-sm">
              {UNIT_OPERATING_HOURS.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-muted-foreground">
                  <dt>{row.label}</dt>
                  <dd className="text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
