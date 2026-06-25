"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, GraduationCap, Megaphone, Images, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/fetcher";

type DashboardData = {
  counts: {
    news: number;
    galleryAlbums: number;
    teachers: number;
    advertisements: number;
    media: number;
  };
  recentActivity: { type: "news" | "teacher" | "advertisement"; id: string; title: string; updatedAt: string }[];
};

const COUNT_CARDS = [
  { key: "news", label: "Berita", icon: Newspaper, href: "/admin/news" },
  { key: "teachers", label: "Guru", icon: GraduationCap, href: "/admin/teachers" },
  { key: "advertisements", label: "Iklan", icon: Megaphone, href: "/admin/advertisements" },
  { key: "galleryAlbums", label: "Album Galeri", icon: Images, href: "/admin/gallery" },
  { key: "media", label: "Media", icon: FolderOpen, href: "/admin/media" },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat data"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {COUNT_CARDS.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {data ? (
                  <p className="text-2xl font-semibold">{data.counts[card.key]}</p>
                ) : (
                  <Skeleton className="h-8 w-12" />
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {!data && !error && (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          )}
          {data && data.recentActivity.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
          )}
          {data && data.recentActivity.length > 0 && (
            <ul className="divide-y">
              {data.recentActivity.map((item) => (
                <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-2 text-sm">
                  <span className="truncate">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
