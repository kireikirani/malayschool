export const dynamic = "force-dynamic";

import Link from "next/link";
import { and, count, desc, eq, gte, isNull, or } from "drizzle-orm";
import { ArrowRight, Lock, Users } from "lucide-react";
import { db } from "@/lib/db";
import { asramaPelajar, news, pengumuman } from "@/db/schema";
import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { CountUp } from "@/components/ui/count-up";
import { SCHOOL_NAME } from "@/lib/brand";
import { ASRAMA_STATS, WARDENS, JK_ASRAMA, ASRAMA_FASILITI } from "@/lib/asrama";
import { getPublicContent } from "@/lib/content";

function StudentTable({
  title,
  rows,
  total,
}: {
  title: string;
  rows: Array<{ id: number; nama: string; tingkatan: string; dorm: string; noWaris: string | null }>;
  total: number;
}) {
  return (
    <div>
      <h3 className="mb-4 font-heading text-lg font-semibold">{title}</h3>
      <div className="overflow-x-auto border border-border/70 bg-card">
        <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
          <span className="font-heading text-sm font-semibold">{title}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="w-8 px-5 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
              <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Nama</th>
              <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Tingkatan</th>
              <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Dorm</th>
              <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">No. Waris</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">Belum ada data pelajar asrama.</td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-3 text-muted-foreground">{index + 1}</td>
                  <td className="px-5 py-3 font-medium">{row.nama}</td>
                  <td className="px-5 py-3 text-muted-foreground">{row.tingkatan}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell">{row.dorm}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{row.noWaris ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-border/40 px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground">Menunjukkan {rows.length} daripada {total} pelajar</p>
        </div>
      </div>
    </div>
  );
}

export default async function AsramaPage() {
  const now = new Date();
  const [sections, maleRows, femaleRows, [maleCount], [femaleCount], latestAnnouncements, latestNews] = await Promise.all([
    getPublicContent("asrama"),
    db.select().from(asramaPelajar).where(and(eq(asramaPelajar.status, "active"), eq(asramaPelajar.jantina, "lelaki"))).limit(20),
    db.select().from(asramaPelajar).where(and(eq(asramaPelajar.status, "active"), eq(asramaPelajar.jantina, "perempuan"))).limit(20),
    db.select({ value: count() }).from(asramaPelajar).where(and(eq(asramaPelajar.status, "active"), eq(asramaPelajar.jantina, "lelaki"))),
    db.select({ value: count() }).from(asramaPelajar).where(and(eq(asramaPelajar.status, "active"), eq(asramaPelajar.jantina, "perempuan"))),
    db.select().from(pengumuman).where(and(eq(pengumuman.aktif, true), or(isNull(pengumuman.tamatPada), gte(pengumuman.tamatPada, now)))).orderBy(pengumuman.sortOrder, desc(pengumuman.createdAt)).limit(3),
    db.select().from(news).where(eq(news.status, "published")).orderBy(desc(news.publishDate)).limit(3),
  ]);

  const totalMale = maleCount.value || ASRAMA_STATS.pelajarLelaki;
  const totalFemale = femaleCount.value || ASRAMA_STATS.pelajarPerempuan;
  const totalStudents = totalMale + totalFemale;

  return (
    <div>
      <PageHeader
        eyebrow={SCHOOL_NAME}
        title="Asrama"
        description="Persekitaran penginapan yang selamat, selesa dan kondusif untuk pembelajaran"
      />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 md:py-16">
        <section>
          <ScrollAnimation direction="up" className="text-center">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Statistik</span>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Maklumat Asrama</h2>
          </ScrollAnimation>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Jumlah Pelajar Asrama", value: totalStudents },
              { label: "Pelajar Lelaki", value: totalMale },
              { label: "Pelajar Perempuan", value: totalFemale },
              { label: "Jumlah Warden", value: ASRAMA_STATS.jumlahWarden },
            ].map((stat) => (
              <div key={stat.label} className="border border-border/70 bg-card px-5 py-6 text-center shadow-[0_16px_40px_-34px_rgba(35,24,16,0.5)]">
                <p className="font-heading text-4xl font-semibold text-primary md:text-5xl"><CountUp value={stat.value} /></p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {sections.map((section) => (
          <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
        ))}

        {/* Fasiliti */}
        <section>
          <ScrollAnimation direction="up">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Kemudahan</span>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Fasiliti Asrama</h2>
          </ScrollAnimation>
          <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            {ASRAMA_FASILITI.map((item, i) => (
              <ScrollAnimation key={item.label} direction="up" delay={i * 0.05}>
                <div className="flex flex-col items-center gap-3 border border-border/70 bg-card px-4 py-6 text-center">
                  <item.icon className="size-7 text-primary" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </section>

        {/* Warden Cards */}
        <section>
          <ScrollAnimation direction="up" className="flex items-center gap-3">
            <Users className="size-5 text-primary" />
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Kakitangan</span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Warden Asrama</h2>
            </div>
          </ScrollAnimation>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WARDENS.map((warden, i) => (
              <ScrollAnimation key={warden.name} direction="up" delay={i * 0.06}>
                <div className="border border-border/70 bg-card px-5 py-5">
                  <p className="font-heading text-base font-semibold">{warden.name}</p>
                  <p className="mt-1 text-sm text-primary">{warden.position}</p>
                  {warden.phone ? <p className="mt-1 text-xs text-muted-foreground">{warden.phone}</p> : null}
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </section>

        {/* JK Asrama Table */}
        <section>
          <ScrollAnimation direction="up">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Organisasi</span>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Jawatankuasa Asrama</h2>
          </ScrollAnimation>
          <div className="mt-6 overflow-x-auto border border-border/70 bg-card">
            <div className="border-b border-border/70 bg-muted/40 px-5 py-3">
              <span className="font-heading text-sm font-semibold">JK Pengurusan Asrama</span>
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
                {JK_ASRAMA.map((member, idx) => (
                  <tr key={member.name} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium">{member.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{member.jawatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <ScrollAnimation direction="up" className="flex items-center gap-3">
            <Lock className="size-5 text-muted-foreground" />
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Data Pelajar</span>
              <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Senarai Pelajar Asrama</h2>
            </div>
          </ScrollAnimation>
          <p className="mt-2 text-sm text-muted-foreground">
            Senarai penghuni asrama yang dikemaskini melalui dashboard admin.
          </p>

          <div className="mt-8 space-y-8">
            <StudentTable title="Aspura (Pelajar Lelaki)" rows={maleRows} total={totalMale} />
            <StudentTable title="Aspuri (Pelajar Perempuan)" rows={femaleRows} total={totalFemale} />
          </div>
        </section>

        <section>
          <ScrollAnimation direction="up" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Berita</span>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Aktiviti Terkini Asrama</h2>
              <p className="mt-2 text-sm text-muted-foreground">Poster pengumuman dan berita berkaitan aktiviti asrama.</p>
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Lihat semua berita
              <ArrowRight className="size-4" />
            </Link>
          </ScrollAnimation>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {latestAnnouncements.length > 0
              ? latestAnnouncements.map((item) => (
                  <Link key={`announcement-${item.id}`} href={item.linkUrl || "/news"} className="overflow-hidden border border-border/70 bg-card">
                    <div className="relative aspect-video w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.tajuk} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-base font-semibold">{item.tajuk}</h3>
                      {item.deskripsi ? <p className="mt-2 text-sm text-muted-foreground">{item.deskripsi}</p> : null}
                    </div>
                  </Link>
                ))
              : latestNews.map((item) => (
                  <Link key={`news-${item.id}`} href={`/news/${item.id}`} className="overflow-hidden border border-border/70 bg-card p-4">
                    <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Berita sekolah terkini berkaitan aktiviti dan program.</p>
                  </Link>
                ))}
          </div>
          {latestAnnouncements.length === 0 && latestNews.length === 0 ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">Belum ada aktiviti terkini asrama.</p>
          ) : null}
        </section>

        <ScrollAnimation direction="up" className="border border-border/70 bg-card px-6 py-8 text-center">
          <h3 className="font-heading text-lg font-semibold">Pertanyaan Asrama</h3>
          <p className="mt-2 text-sm text-muted-foreground">Untuk maklumat lanjut mengenai asrama, sila hubungi pejabat sekolah.</p>
          <Link href="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Hubungi Kami
            <ArrowRight className="size-4" />
          </Link>
        </ScrollAnimation>
      </div>
    </div>
  );
}
