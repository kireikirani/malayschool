export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Asrama",
  description: "Maklumat asrama SMK Telok Panglima Garang — fasiliti, warden, jawatankuasa, dan senarai pelajar penghuni.",
};
import { and, asc, count, desc, eq, gte, isNull, or } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { db } from "@/lib/db";
import { asramaPelajar, asramaFasiliti, unitJkMembers, news, pengumuman } from "@/db/schema";
import { PageHeader } from "@/components/public/page-header";
import { ContentSectionRenderer } from "@/components/public/content-section-renderer";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { CountUp } from "@/components/ui/count-up";
import { SCHOOL_NAME } from "@/lib/brand";
import { ASRAMA_STATS, JK_ASRAMA, ASRAMA_FASILITI } from "@/lib/asrama";
import { getPublicContent } from "@/lib/content";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return "60" + digits.slice(1);
  return "60" + digits;
}

function PhoneLinks({ phone }: { phone: string }) {
  const wa = waNumber(phone);
  return (
    <span className="flex flex-wrap items-center gap-2">
      <a href={`tel:+${wa}`} className="font-medium text-primary hover:underline">{phone}</a>
      <a
        href={`https://wa.me/${wa}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-green-700"
      >
        WA
      </a>
    </span>
  );
}

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
                  <td className="px-5 py-3 hidden md:table-cell">
                    {row.noWaris ? <PhoneLinks phone={row.noWaris} /> : <span className="text-muted-foreground">-</span>}
                  </td>
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
  const [
    sections,
    [maleCount],
    [femaleCount],
    dbFasiliti,
    dbJkAsrama,
    latestAnnouncements,
    latestNews,
  ] = await Promise.all([
    getPublicContent("asrama"),
    db.select({ value: count() }).from(asramaPelajar).where(and(eq(asramaPelajar.status, "active"), eq(asramaPelajar.jantina, "lelaki"))),
    db.select({ value: count() }).from(asramaPelajar).where(and(eq(asramaPelajar.status, "active"), eq(asramaPelajar.jantina, "perempuan"))),
    db.select().from(asramaFasiliti).orderBy(asc(asramaFasiliti.sortOrder), asc(asramaFasiliti.id)),
    db.select().from(unitJkMembers).where(eq(unitJkMembers.unitSlug, "asrama")).orderBy(asc(unitJkMembers.jkCode), asc(unitJkMembers.sortOrder)),
    db.select().from(pengumuman).where(and(eq(pengumuman.aktif, true), or(isNull(pengumuman.tamatPada), gte(pengumuman.tamatPada, now)))).orderBy(pengumuman.sortOrder, desc(pengumuman.createdAt)).limit(3),
    db.select().from(news).where(eq(news.status, "published")).orderBy(desc(news.publishDate)).limit(3),
  ]);

  const HARDCODED_FASILITI_ICONS: Record<string, string> = {
    "Bilik Tidur Sistematik": "BedDouble",
    "Dewan Makan": "Utensils",
    "Bilik Belajar": "BookOpen",
    "Surau": "Landmark",
    "Padang Sukan": "Trophy",
    "Bilik Dobi": "Shirt",
    "Wi-Fi Percuma": "Wifi",
    "CCTV 24 Jam": "ShieldCheck",
  };
  const fasiliti = dbFasiliti.length > 0
    ? dbFasiliti
    : ASRAMA_FASILITI.map((f, i) => ({ id: i, iconName: HARDCODED_FASILITI_ICONS[f.label] ?? "Star", label: f.label, sortOrder: i, createdAt: new Date(), updatedAt: new Date() }));
  const jkAsrama = dbJkAsrama.length > 0 ? dbJkAsrama : JK_ASRAMA.map((m, i) => ({ id: i, unitSlug: "asrama", jkCode: "jk-asrama", jkTitle: "JK Asrama", nama: m.name, jawatan: m.jawatan, sortOrder: i, createdAt: new Date(), updatedAt: new Date() }));

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

      {/* Section 1: Stats — light blue */}
      <section className="bg-blue-50 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up" className="text-center">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Statistik</span>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Maklumat Asrama</h2>
          </ScrollAnimation>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Jumlah Pelajar Asrama", value: totalStudents },
              { label: "Pelajar Lelaki", value: totalMale },
              { label: "Pelajar Perempuan", value: totalFemale },
            ].map((stat) => (
              <div key={stat.label} className="bg-white px-5 py-6 text-center shadow-sm">
                <p className="font-heading text-4xl font-semibold text-primary md:text-5xl"><CountUp value={stat.value} /></p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Dynamic content — white */}
      {sections.length > 0 && (
        <section className="bg-background py-14 md:py-20">
          <div className="mx-auto max-w-6xl space-y-16 px-4">
            {sections.map((section) => (
              <ContentSectionRenderer key={`${section.sectionKey}-${section.sortOrder}`} section={section} />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Fasiliti — light slate */}
      <section className="bg-slate-50 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Kemudahan</span>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Fasiliti Asrama</h2>
          </ScrollAnimation>
          <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            {fasiliti.map((item, i) => (
              <ScrollAnimation key={item.label} direction="up" delay={i * 0.05}>
                <div className="flex flex-col items-center gap-3 bg-white px-4 py-6 text-center shadow-sm">
                  <DynamicIcon name={item.iconName} className="size-7 text-primary" />
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: JK Asrama — light blue */}
      <section className="bg-blue-50 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Organisasi</span>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">Jawatankuasa Asrama</h2>
          </ScrollAnimation>
          <div className="mt-6 overflow-x-auto border border-blue-200/60 bg-white shadow-sm">
            <div className="border-b border-blue-200/60 bg-blue-600/10 px-5 py-3">
              <span className="font-heading text-sm font-semibold text-blue-700">JK Pengurusan Asrama</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="w-8 px-5 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                  <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Nama</th>
                  <th className="px-5 py-2 text-left text-xs font-medium text-muted-foreground">Jawatan</th>
                </tr>
              </thead>
              <tbody>
                {jkAsrama.map((member, idx) => (
                  <tr key={member.id} className="border-b border-border/40 last:border-0 hover:bg-blue-50/60 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium">{member.nama}</td>
                    <td className="px-5 py-3 text-muted-foreground">{member.jawatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 6: Berita/Aktiviti — primary dark blue */}
      <section className="bg-primary py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary-foreground/70 uppercase">Berita</span>
              <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight text-primary-foreground md:text-3xl">Aktiviti Terkini Asrama</h2>
              <p className="mt-2 text-sm text-primary-foreground/70">Poster pengumuman dan berita berkaitan aktiviti asrama.</p>
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground hover:underline">
              Lihat semua berita
              <ArrowRight className="size-4" />
            </Link>
          </ScrollAnimation>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {latestAnnouncements.length > 0
              ? latestAnnouncements.map((item) => (
                  <Link key={`announcement-${item.id}`} href={item.linkUrl || "/news"} className="overflow-hidden border border-white/20 bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="relative aspect-video w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.tajuk} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading text-base font-semibold text-primary-foreground">{item.tajuk}</h3>
                      {item.deskripsi ? <p className="mt-2 text-sm text-primary-foreground/70">{item.deskripsi}</p> : null}
                    </div>
                  </Link>
                ))
              : latestNews.map((item) => (
                  <Link key={`news-${item.id}`} href={`/news/${item.id}`} className="overflow-hidden border border-white/20 bg-white/10 hover:bg-white/20 transition-colors p-4">
                    <h3 className="font-heading text-base font-semibold text-primary-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-primary-foreground/70">Berita sekolah terkini berkaitan aktiviti dan program.</p>
                  </Link>
                ))}
          </div>
          {latestAnnouncements.length === 0 && latestNews.length === 0 ? (
            <p className="mt-4 text-center text-xs text-primary-foreground/60">Belum ada aktiviti terkini asrama.</p>
          ) : null}
        </div>
      </section>

      {/* Section 7: CTA — white */}
      <section className="bg-background py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up" className="bg-card px-6 py-10 text-center shadow-sm">
            <h3 className="font-heading text-lg font-semibold">Pertanyaan Asrama</h3>
            <p className="mt-2 text-sm text-muted-foreground">Untuk maklumat lanjut mengenai asrama, sila hubungi pejabat sekolah.</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Hubungi Kami
              <ArrowRight className="size-4" />
            </Link>
          </ScrollAnimation>
        </div>
      </section>
    </div>
  );
}
