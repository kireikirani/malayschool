import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { news, teachers, galleryAlbums } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://malayschool.vercel.app/";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedNews, activeTeachers, albums] = await Promise.all([
    db.select({ id: news.id, publishDate: news.publishDate }).from(news).where(eq(news.status, "published")),
    db.select({ id: teachers.id }).from(teachers).where(eq(teachers.status, "active")),
    db.select({ id: galleryAlbums.id, updatedAt: galleryAlbums.updatedAt }).from(galleryAlbums),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}news`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}teachers`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}gallery`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}admissions`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}asrama`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}ubk`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}borang`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}dokumen-sekolah`, changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...staticRoutes,
    ...publishedNews.map((row) => ({
      url: `${BASE}news/${row.id}`,
      lastModified: row.publishDate ? new Date(row.publishDate) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...activeTeachers.map((row) => ({
      url: `${BASE}teachers/${row.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...albums.map((row) => ({
      url: `${BASE}gallery/${row.id}`,
      lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
