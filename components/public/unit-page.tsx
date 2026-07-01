import { Clock, FileText, Users } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { UNIT_OPERATING_HOURS, type Unit } from "@/lib/units";
import { SCHOOL_NAME } from "@/lib/brand";
import { getUnitSections } from "@/lib/content";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { CountUp } from "@/components/ui/count-up";

export async function UnitPage({ unit }: { unit: Unit }) {
  const sections = await getUnitSections(unit.slug);

  return (
    <div>
      <PageHeader eyebrow={SCHOOL_NAME} title={unit.title} description={`${unit.headName} - ${unit.headPosition}`} />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:py-16">

        {/* KPI Stats */}
        {unit.kpis.length > 0 && (
          <section>
            <ScrollAnimation direction="up">
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Prestasi</span>
              <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Petunjuk Prestasi Utama (KPI)</h2>
            </ScrollAnimation>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {unit.kpis.map((kpi, i) => (
                <ScrollAnimation key={kpi.label} direction="up" delay={i * 0.06}>
                  <div className="border border-border/70 bg-card px-5 py-6 text-center">
                    <p className="font-heading text-4xl font-semibold text-primary md:text-5xl">
                      {kpi.value % 1 !== 0 ? kpi.value : <CountUp value={kpi.value} />}
                      {kpi.suffix ?? ""}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{kpi.label}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </section>
        )}

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

        {/* JK Tables */}
        {unit.jkTables && unit.jkTables.length > 0 && (
          <section className="space-y-8">
            <ScrollAnimation direction="up" className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <span className="text-sm font-semibold tracking-wide text-primary uppercase">Organisasi</span>
                <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Jawatankuasa</h2>
              </div>
            </ScrollAnimation>
            {unit.jkTables.map((table) => (
              <ScrollAnimation key={table.title} direction="up">
                <div className="overflow-x-auto border border-border/70 bg-card">
                  <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
                    <span className="font-heading text-sm font-semibold">{table.title}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="w-8 px-5 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                        <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Nama</th>
                        <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Jawatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.members.map((member, idx) => (
                        <tr key={member.name} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                          <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                          <td className="px-5 py-3 font-medium">{member.name}</td>
                          <td className="px-5 py-3 text-muted-foreground">{member.jawatan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollAnimation>
            ))}
          </section>
        )}

        {/* Dokumen */}
        {unit.dokumen && unit.dokumen.length > 0 && (
          <section>
            <ScrollAnimation direction="up" className="flex items-center gap-3">
              <FileText className="size-5 text-primary" />
              <div>
                <span className="text-sm font-semibold tracking-wide text-primary uppercase">Rujukan</span>
                <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Dokumen Unit</h2>
              </div>
            </ScrollAnimation>
            <div className="mt-6 space-y-3">
              {unit.dokumen.map((doc, i) => (
                <ScrollAnimation key={doc.label} direction="up" delay={i * 0.04}>
                  <div className="flex items-start gap-4 border border-border/70 bg-card px-5 py-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center bg-primary/8 text-primary">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{doc.label}</p>
                      {doc.desc ? <p className="mt-0.5 text-xs text-muted-foreground">{doc.desc}</p> : null}
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Dokumen boleh dimuat turun melalui halaman <a href="/dokumen-sekolah" className="text-primary hover:underline">Dokumen Sekolah</a> apabila tersedia.</p>
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
