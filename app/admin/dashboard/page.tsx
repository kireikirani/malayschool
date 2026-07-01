"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Newspaper,
  GraduationCap,
  Megaphone,
  Images,
  FolderOpen,
  RefreshCw,
  MoreHorizontal,
  ArrowUpRight,
  Bell,
  PanelsTopLeft,
  Layers3,
  BedDouble,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { apiGet } from "@/lib/fetcher";

type ActivityType = "news" | "teacher" | "advertisement" | "announcement" | "content" | "asrama" | "unit-dokumen";

type ActivityRow = { type: ActivityType; id: string; title: string; updatedAt: string };

type DashboardData = {
  counts: {
    news: number;
    galleryAlbums: number;
    teachers: number;
    advertisements: number;
    media: number;
    announcements: number;
    publicContent: number;
    unitSections: number;
    asramaStudents: number;
    unitDocuments: number;
  };
  health: {
    missingUnitCharts: number;
    emptyAboutSections: number;
    emptyAnnouncements: number;
    emptyUnitSections: number;
  };
  recentActivity: ActivityRow[];
};

const COUNT_CARDS = [
  { key: "publicContent", label: "Public Content", icon: PanelsTopLeft, href: "/admin/content", chip: "bg-[var(--chart-1)]/10 text-[var(--chart-1)]" },
  { key: "announcements", label: "Pengumuman", icon: Bell, href: "/admin/pengumuman", chip: "bg-[var(--chart-2)]/15 text-[var(--chart-2)]" },
  { key: "unitSections", label: "Unit Sections", icon: Layers3, href: "/admin/units", chip: "bg-[var(--chart-3)]/15 text-[var(--chart-3)]" },
  { key: "unitDocuments", label: "Dokumen Unit", icon: FolderOpen, href: "/admin/unit-dokumen", chip: "bg-[var(--chart-4)]/15 text-[var(--chart-4)]" },
  { key: "asramaStudents", label: "Pelajar Asrama", icon: BedDouble, href: "/admin/asrama-pelajar", chip: "bg-[var(--chart-5)]/15 text-[var(--chart-5)]" },
  { key: "news", label: "Berita", icon: Newspaper, href: "/admin/news", chip: "bg-[var(--chart-1)]/10 text-[var(--chart-1)]" },
  { key: "teachers", label: "Guru", icon: GraduationCap, href: "/admin/teachers", chip: "bg-[var(--chart-2)]/15 text-[var(--chart-2)]" },
  { key: "galleryAlbums", label: "Album Galeri", icon: Images, href: "/admin/gallery", chip: "bg-[var(--chart-3)]/15 text-[var(--chart-3)]" },
  { key: "media", label: "Media", icon: FolderOpen, href: "/admin/media", chip: "bg-[var(--chart-4)]/15 text-[var(--chart-4)]" },
  { key: "advertisements", label: "Iklan", icon: Megaphone, href: "/admin/advertisements", chip: "bg-[var(--chart-5)]/15 text-[var(--chart-5)]" },
] as const;

const HEALTH_CARDS = [
  { key: "missingUnitCharts", label: "Unit tanpa carta organisasi", href: "/admin/unit-dokumen" },
  { key: "emptyAboutSections", label: "About belum dikustomisasi", href: "/admin/content" },
  { key: "emptyAnnouncements", label: "Poster info terkini kosong", href: "/admin/pengumuman" },
  { key: "emptyUnitSections", label: "Unit sections kosong", href: "/admin/units" },
] as const;

const TYPE_META: Record<ActivityType, { label: string; href: string; variant: "default" | "secondary" | "outline" }> = {
  news: { label: "Berita", href: "/admin/news", variant: "default" },
  teacher: { label: "Guru", href: "/admin/teachers", variant: "secondary" },
  advertisement: { label: "Iklan", href: "/admin/advertisements", variant: "outline" },
  announcement: { label: "Pengumuman", href: "/admin/pengumuman", variant: "secondary" },
  content: { label: "Content", href: "/admin/content", variant: "outline" },
  asrama: { label: "Asrama", href: "/admin/asrama-pelajar", variant: "default" },
  "unit-dokumen": { label: "Dokumen", href: "/admin/unit-dokumen", variant: "secondary" },
};

const PAGE_SIZE = 8;

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  function load(showToast = false) {
    setIsLoading(true);
    apiGet<DashboardData>("/api/dashboard")
      .then((res) => {
        setData(res);
        setError(null);
        if (showToast) toast.success("Data dashboard diperbarui");
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Gagal memuat data";
        setError(message);
        if (showToast) toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const totalPages = data ? Math.max(1, Math.ceil(data.recentActivity.length / PAGE_SIZE)) : 1;

  const pagedActivity = useMemo(() => {
    if (!data) return [];
    const start = (page - 1) * PAGE_SIZE;
    return data.recentActivity.slice(start, start + PAGE_SIZE);
  }, [data, page]);

  const columns: ColumnDef<ActivityRow, unknown>[] = [
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => {
        const meta = TYPE_META[row.original.type];
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    { accessorKey: "title", header: "Judul" },
    {
      accessorKey: "updatedAt",
      header: "Diperbarui",
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const meta = TYPE_META[row.original.type];
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(meta.href)}>
                Lihat {meta.label.toLowerCase()}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(row.original.title);
                  toast.success("Judul disalin ke clipboard");
                }}
              >
                Salin judul
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan konten, health check, dan aktivitas terbaru</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={isLoading}>
          <RefreshCw className={isLoading ? "animate-spin" : ""} />
          Segarkan
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {COUNT_CARDS.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="gap-3 py-4 transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <span className={`flex size-8 items-center justify-center rounded-full ${card.chip}`}>
                  <card.icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent className="px-4">
                {data ? <p className="text-2xl font-semibold">{data.counts[card.key]}</p> : <Skeleton className="h-8 w-12" />}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {HEALTH_CARDS.map((card) => (
          <Link key={card.key} href={card.href}>
            <Card className="gap-3 py-4 transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <TriangleAlert className="size-4 text-amber-600" />
              </CardHeader>
              <CardContent className="px-4">
                {data ? <p className="text-2xl font-semibold">{data.health[card.key]}</p> : <Skeleton className="h-8 w-12" />}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          {data && data.recentActivity.length > 0 && <span className="text-xs text-muted-foreground">{data.recentActivity.length} entri</span>}
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={pagedActivity}
            isLoading={isLoading && !data}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyMessage="Belum ada aktivitas."
          />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/content/new", label: "Tambah Public Content" },
          { href: "/admin/pengumuman/new", label: "Tambah Pengumuman" },
          { href: "/admin/units/new", label: "Tambah Unit Section" },
          { href: "/admin/asrama-pelajar/new", label: "Tambah Pelajar Asrama" },
          { href: "/admin/unit-dokumen", label: "Urus Dokumen Unit" },
          { href: "/admin/advertisements/new", label: "Tambah Iklan" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-md border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50">
            {item.label}
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
