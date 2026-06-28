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

type ActivityType = "news" | "teacher" | "advertisement";

type ActivityRow = { type: ActivityType; id: string; title: string; updatedAt: string };

type DashboardData = {
  counts: {
    news: number;
    galleryAlbums: number;
    teachers: number;
    advertisements: number;
    media: number;
  };
  recentActivity: ActivityRow[];
};

const COUNT_CARDS = [
  {
    key: "news",
    label: "Berita",
    icon: Newspaper,
    href: "/admin/news",
    chip: "bg-[var(--chart-1)]/10 text-[var(--chart-1)]",
  },
  {
    key: "teachers",
    label: "Guru",
    icon: GraduationCap,
    href: "/admin/teachers",
    chip: "bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
  },
  {
    key: "advertisements",
    label: "Iklan",
    icon: Megaphone,
    href: "/admin/advertisements",
    chip: "bg-[var(--chart-3)]/15 text-[var(--chart-3)]",
  },
  {
    key: "galleryAlbums",
    label: "Album Galeri",
    icon: Images,
    href: "/admin/gallery",
    chip: "bg-[var(--chart-4)]/15 text-[var(--chart-4)]",
  },
  {
    key: "media",
    label: "Media",
    icon: FolderOpen,
    href: "/admin/media",
    chip: "bg-[var(--chart-5)]/15 text-[var(--chart-5)]",
  },
] as const;

const TYPE_META: Record<ActivityType, { label: string; href: string; variant: "default" | "secondary" | "outline" }> = {
  news: { label: "Berita", href: "/admin/news", variant: "default" },
  teacher: { label: "Guru", href: "/admin/teachers", variant: "secondary" },
  advertisement: { label: "Iklan", href: "/admin/advertisements", variant: "outline" },
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
          <p className="text-sm text-muted-foreground">Ringkasan konten dan aktivitas terbaru</p>
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

      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          {data && data.recentActivity.length > 0 && (
            <span className="text-xs text-muted-foreground">{data.recentActivity.length} entri</span>
          )}
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

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/news/new"
          className="flex items-center justify-between rounded-md border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50"
        >
          Tambah Berita
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
        <Link
          href="/admin/teachers/new"
          className="flex items-center justify-between rounded-md border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50"
        >
          Tambah Guru
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
        <Link
          href="/admin/advertisements/new"
          className="flex items-center justify-between rounded-md border bg-card px-4 py-3 text-sm transition-colors hover:bg-muted/50"
        >
          Tambah Iklan
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
