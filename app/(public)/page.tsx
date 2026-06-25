import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { news, galleryAlbums, teachers } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/public/news-card";
import { GalleryAlbumCard } from "@/components/public/gallery-album-card";
import { TeacherCard } from "@/components/public/teacher-card";
import { AdSlot } from "@/components/public/ad-slot";

export default async function HomePage() {
  const [latestNews, latestAlbums, activeTeachers] = await Promise.all([
    db.select().from(news).where(eq(news.status, "published")).orderBy(desc(news.publishDate)).limit(4),
    db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdAt)).limit(3),
    db.select().from(teachers).where(eq(teachers.status, "active")).orderBy(desc(teachers.createdAt)).limit(4),
  ]);

  return (
    <div className="space-y-16 py-10">
      <section className="mx-auto max-w-6xl space-y-4 px-4 text-center">
        <h1 className="text-4xl font-semibold">Selamat Datang di Sekolah Kita</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Membentuk generasi unggul melalui pendidikan yang berkualitas, berkarakter, dan berwawasan luas.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/about">Tentang Kami</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Kontak</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <AdSlot placement="homepage_top" />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Berita Terbaru</h2>
              <Link href="/news" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            {latestNews.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada berita.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {latestNews.map((row) => (
                  <NewsCard
                    key={row.id}
                    id={row.id}
                    title={row.title}
                    thumbnail={row.thumbnail}
                    publishDate={row.publishDate?.toISOString() ?? null}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Galeri</h2>
              <Link href="/gallery" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            {latestAlbums.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada album.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestAlbums.map((row) => (
                  <GalleryAlbumCard key={row.id} id={row.id} name={row.name} coverImage={row.coverImage} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Guru Kami</h2>
              <Link href="/teachers" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            {activeTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data guru.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {activeTeachers.map((row) => (
                  <TeacherCard key={row.id} id={row.id} name={row.name} position={row.position} photo={row.photo} />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <AdSlot placement="homepage_sidebar" />
        </aside>
      </section>
    </div>
  );
}
