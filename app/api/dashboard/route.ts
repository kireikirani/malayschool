import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { advertisements, asramaPelajar, galleryAlbums, media, news, pengumuman, publicContent, teachers, unitDocuments, unitSections, user } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";
import { UNITS } from "@/lib/units";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const [
      [{ total: totalNews }],
      [{ total: totalGalleryAlbums }],
      [{ total: totalTeachers }],
      [{ total: totalAdvertisements }],
      [{ total: totalMedia }],
      [{ total: totalAnnouncements }],
      [{ total: totalPublicContent }],
      [{ total: totalUnitSections }],
      [{ total: totalAsramaStudents }],
      [{ total: totalUnitDocs }],
      [{ total: totalCarta }],
      [{ total: totalAboutSections }],
      recentNews,
      recentTeachers,
      recentAdvertisements,
      recentAnnouncements,
      recentContent,
      recentAsrama,
      recentUnitDocs,
      [{ total: pendingTeachersCount }],
    ] = await Promise.all([
      db.select({ total: count() }).from(news),
      db.select({ total: count() }).from(galleryAlbums),
      db.select({ total: count() }).from(teachers),
      db.select({ total: count() }).from(advertisements),
      db.select({ total: count() }).from(media),
      db.select({ total: count() }).from(pengumuman),
      db.select({ total: count() }).from(publicContent),
      db.select({ total: count() }).from(unitSections),
      db.select({ total: count() }).from(asramaPelajar).where(eq(asramaPelajar.status, "active")),
      db.select({ total: count() }).from(unitDocuments).where(eq(unitDocuments.type, "dokumen")),
      db.select({ total: count() }).from(unitDocuments).where(eq(unitDocuments.type, "carta-org")),
      db.select({ total: count() }).from(publicContent).where(eq(publicContent.pageKey, "about")),
      db.select().from(news).orderBy(desc(news.updatedAt)).limit(10),
      db.select().from(teachers).orderBy(desc(teachers.updatedAt)).limit(10),
      db.select().from(advertisements).orderBy(desc(advertisements.updatedAt)).limit(10),
      db.select().from(pengumuman).orderBy(desc(pengumuman.updatedAt)).limit(10),
      db.select().from(publicContent).orderBy(desc(publicContent.updatedAt)).limit(10),
      db.select().from(asramaPelajar).orderBy(desc(asramaPelajar.updatedAt)).limit(10),
      db.select().from(unitDocuments).orderBy(desc(unitDocuments.updatedAt)).limit(10),
      db.select({ total: count() }).from(user).where(
        and(
          eq(user.role, "teacher"),
          eq(user.isApproved, false),
          isNull(user.rejectionReason)
        )
      ),
    ]);

    const recentActivity = [
      ...recentNews.map((row) => ({ type: "news" as const, id: row.id, title: row.title, updatedAt: row.updatedAt })),
      ...recentTeachers.map((row) => ({ type: "teacher" as const, id: row.id, title: row.name, updatedAt: row.updatedAt })),
      ...recentAdvertisements.map((row) => ({ type: "advertisement" as const, id: row.id, title: row.name, updatedAt: row.updatedAt })),
      ...recentAnnouncements.map((row) => ({ type: "announcement" as const, id: String(row.id), title: row.tajuk, updatedAt: row.updatedAt })),
      ...recentContent.map((row) => ({ type: "content" as const, id: String(row.id), title: row.title ?? `${row.pageKey}:${row.sectionKey}`, updatedAt: row.updatedAt })),
      ...recentAsrama.map((row) => ({ type: "asrama" as const, id: String(row.id), title: row.nama, updatedAt: row.updatedAt })),
      ...recentUnitDocs.map((row) => ({ type: "unit-dokumen" as const, id: String(row.id), title: row.label, updatedAt: row.updatedAt })),
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
        announcements: totalAnnouncements,
        publicContent: totalPublicContent,
        unitSections: totalUnitSections,
        asramaStudents: totalAsramaStudents,
        unitDocuments: totalUnitDocs,
        pendingTeachers: pendingTeachersCount,
      },
      health: {
        missingUnitCharts: Math.max(UNITS.length - totalCarta, 0),
        emptyAboutSections: totalAboutSections === 0 ? 1 : 0,
        emptyAnnouncements: totalAnnouncements === 0 ? 1 : 0,
        emptyUnitSections: totalUnitSections === 0 ? 1 : 0,
      },
      recentActivity,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
