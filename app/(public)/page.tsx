export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { and, count, desc, eq, like, or, isNull, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryAlbums, news, pengumuman, teachers } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { NewsCard } from "@/components/public/news-card";
import { GalleryAlbumCard } from "@/components/public/gallery-album-card";
import { AdSlot } from "@/components/public/ad-slot";
import { Hero } from "@/components/public/home/hero";
import { WhyChooseUs } from "@/components/public/home/why-choose-us";
import { AcademicPrograms } from "@/components/public/home/academic-programs";
import { PrincipalMessage } from "@/components/public/home/principal-message";
import { FacilitiesPreview } from "@/components/public/home/facilities-preview";
import { AdmissionsCta } from "@/components/public/home/admissions-cta";
import { ContactSection } from "@/components/public/home/contact-section";
import { StatsCounter } from "@/components/public/home/stats-counter";
import { PibgDonation } from "@/components/public/home/pibg-donation";
import { CountdownSpm } from "@/components/public/home/countdown-spm";
import { VisionMission } from "@/components/public/home/vision-mission";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { getPublicContentSection } from "@/lib/content";
import { getSettings } from "@/lib/site-settings";

export default async function HomePage() {
  const now = new Date();
  const [settings, heroSection, profileSection, pibgSection, latestNews, latestAlbums, announcements, [teacherCount], [principal]] = await Promise.all([
    getSettings(),
    getPublicContentSection("home", "hero"),
    getPublicContentSection("home", "school-profile"),
    getPublicContentSection("home", "pibg-profile"),
    db.select().from(news).where(eq(news.status, "published")).orderBy(desc(news.publishDate)).limit(3),
    db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt)).limit(6),
    db
      .select()
      .from(pengumuman)
      .where(and(eq(pengumuman.aktif, true), or(isNull(pengumuman.tamatPada), gte(pengumuman.tamatPada, now))))
      .orderBy(pengumuman.sortOrder, desc(pengumuman.createdAt))
      .limit(3),
    db.select({ value: count() }).from(teachers).where(eq(teachers.status, "active")),
    db
      .select()
      .from(teachers)
      .where(and(eq(teachers.status, "active"), like(teachers.position, "%Pengetua%")))
      .limit(1),
  ]);

  return (
    <div>
      <Hero
        title={heroSection?.title ?? settings.schoolName}
        tagline={heroSection?.subtitle ?? settings.schoolTagline}
        imageUrl={heroSection?.imageUrl ?? "/gallery/sekolah/bangunan-sekolah.jpg"}
      />

      <AdSlot placement="homepage_top" className="mx-auto max-w-7xl px-4 sm:px-6 pt-12" />

      <StatsCounter
        teacherCount={teacherCount.value}
        students={settings.statsStudents}
        supportStaff={settings.statsSupportStaff}
        classes={settings.statsClasses}
        spmCandidates={settings.statsSpmCandidates}
      />

      {profileSection ? (
        <section className="pb-4">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <p className="text-sm text-muted-foreground">{profileSection.body ?? profileSection.subtitle}</p>
          </div>
        </section>
      ) : null}

      <VisionMission vision={settings.schoolVision} mission={settings.schoolMission} />

      <WhyChooseUs />
      <AcademicPrograms />
      {principal && (
        <PrincipalMessage
          name={principal.name}
          position={principal.position}
          photo={principal.photo}
          message={principal.biography}
        />
      )}
      <FacilitiesPreview />
      <CountdownSpm spmDate={settings.spmDate} />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Terkini</span>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Info & Pengumuman
              </h2>
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Lihat semua berita
              <ArrowRight className="size-4" />
            </Link>
          </ScrollAnimation>
          {announcements.length === 0 ? (
            <div className="mt-8 border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center">
              <p className="text-sm font-medium">Belum ada poster info terkini</p>
              <p className="mt-1 text-xs text-muted-foreground">Admin boleh menambah poster melalui menu Pengumuman.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {announcements.map((item, index) => (
                <ScrollAnimation key={item.id} direction="up" delay={index * 0.08} className="h-full">
                  <Link href={item.linkUrl || "/news"} className="group flex h-full flex-col overflow-hidden border border-border/70 bg-card">
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.tajuk} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    </div>
                    <div className="flex flex-1 flex-col space-y-1 p-3">
                      <h3 className="font-heading text-sm font-semibold leading-snug line-clamp-2">{item.tajuk}</h3>
                      {item.deskripsi ? <p className="text-xs text-muted-foreground line-clamp-2">{item.deskripsi}</p> : null}
                    </div>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      <PibgDonation
        title={pibgSection?.title ?? "Sumbangan Anda Membina Masa Depan Mereka"}
        subtitle={pibgSection?.subtitle ?? undefined}
        body={pibgSection?.body ?? undefined}
        accountName={settings.pibgAccountName}
        bankName={settings.pibgBankName}
        accountNumber={settings.pibgAccountNumber}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary uppercase">Berita & Pengumuman</span>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Perkembangan Terkini Sekolah
              </h2>
            </div>
            <Link href="/news" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Lihat semua berita
              <ArrowRight className="size-4" />
            </Link>
          </ScrollAnimation>

          {latestNews.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Belum ada berita.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {latestNews.map((row, i) => (
                <ScrollAnimation key={row.id} direction="up" delay={i * 0.08} className="relative">
                  <Badge className="absolute top-3 left-3 z-10">
                    {row.publishDate ? new Date(row.publishDate).toLocaleDateString("ms-MY") : "Baharu"}
                  </Badge>
                  <NewsCard
                    id={row.id}
                    title={row.title}
                    thumbnail={row.thumbnail}
                    publishDate={row.publishDate?.toISOString() ?? null}
                  />
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <ScrollAnimation direction="up" className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold tracking-wide text-primary-foreground/80 uppercase">Galeri</span>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
                Detik-detik di Sekolah Kami
              </h2>
            </div>
            <Link href="/gallery" className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground hover:underline">
              Lihat galeri penuh
              <ArrowRight className="size-4" />
            </Link>
          </ScrollAnimation>

          {latestAlbums.length === 0 ? (
            <p className="mt-8 text-sm text-primary-foreground/70">Belum ada album.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {latestAlbums.map((row, i) => (
                <ScrollAnimation
                  key={row.id}
                  direction="up"
                  delay={(i % 6) * 0.06}
                  className={i === 0 ? "col-span-2 row-span-2 sm:col-span-1" : ""}
                >
                  <GalleryAlbumCard id={row.id} name={row.name} coverImage={row.coverImage} />
                </ScrollAnimation>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdmissionsCta />
      <ContactSection />

      <AdSlot placement="homepage_sidebar" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16" />
    </div>
  );
}
