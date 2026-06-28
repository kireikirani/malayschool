import { count, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { advertisements, galleryAlbums, media, news, teachers } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const [
      [{ total: totalNews }],
      [{ total: totalGalleryAlbums }],
      [{ total: totalTeachers }],
      [{ total: totalAdvertisements }],
      [{ total: totalMedia }],
      recentNews,
      recentTeachers,
      recentAdvertisements,
    ] = await Promise.all([
      db.select({ total: count() }).from(news),
      db.select({ total: count() }).from(galleryAlbums),
      db.select({ total: count() }).from(teachers),
      db.select({ total: count() }).from(advertisements),
      db.select({ total: count() }).from(media),
      db.select().from(news).orderBy(desc(news.updatedAt)).limit(15),
      db.select().from(teachers).orderBy(desc(teachers.updatedAt)).limit(15),
      db.select().from(advertisements).orderBy(desc(advertisements.updatedAt)).limit(15),
    ]);

    const recentActivity = [
      ...recentNews.map((row) => ({ type: "news" as const, id: row.id, title: row.title, updatedAt: row.updatedAt })),
      ...recentTeachers.map((row) => ({ type: "teacher" as const, id: row.id, title: row.name, updatedAt: row.updatedAt })),
      ...recentAdvertisements.map((row) => ({ type: "advertisement" as const, id: row.id, title: row.name, updatedAt: row.updatedAt })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 30);

    return ok({
      counts: {
        news: totalNews,
        galleryAlbums: totalGalleryAlbums,
        teachers: totalTeachers,
        advertisements: totalAdvertisements,
        media: totalMedia,
      },
      recentActivity,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
