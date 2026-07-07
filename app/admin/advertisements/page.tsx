"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageTour } from "@/components/admin/tour/page-tour";
import { advertisementsSteps } from "@/components/admin/tour/tour-steps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { apiSend } from "@/lib/fetcher";

type AdRow = {
  id: string;
  name: string;
  placement: string;
  status: "active" | "inactive";
};

const PLACEMENT_LABELS: Record<string, string> = {
  homepage_top: "Atas Beranda",
  homepage_sidebar: "Sidebar Beranda",
  news_detail: "Detail Berita",
  footer: "Footer",
};

async function fetchAds(params: URLSearchParams): Promise<{ rows: AdRow[]; totalPages: number }> {
  const res = await fetch(`/api/advertisements?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function AdvertisementsListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AdRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [placement, setPlacement] = useState<string>("all");

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (placement !== "all") params.set("placement", placement);
    fetchAds(params)
      .then(({ rows, totalPages }) => {
        setRows(rows);
        setTotalPages(totalPages);
      })
      .catch((err) => toast.error(err.message))
        .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, placement]);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/advertisements/${id}`, "DELETE");
      toast.success("Iklan dihapus");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  async function handleToggle(id: string) {
    setTogglingId(id);
    setIsLoading(true);
    try {
      await apiSend(`/api/advertisements/${id}/toggle-status`, "PATCH");
      toast.success("Status diperbarui");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui status");
    } finally {
      setTogglingId(null);
    }
  }

  const columns: ColumnDef<AdRow, unknown>[] = [
    { accessorKey: "name", header: "Nama" },
    {
      accessorKey: "placement",
      header: "Penempatan",
      cell: ({ row }) => PLACEMENT_LABELS[row.original.placement] ?? row.original.placement,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "isLive",
      header: "Tayang",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={row.original.status === "active"}
            disabled={togglingId === row.original.id}
            onCheckedChange={() => handleToggle(row.original.id)}
          />
          <span className="text-sm text-muted-foreground">
            {row.original.status === "active" ? "Aktif" : "Nonaktif"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/admin/advertisements/${row.original.id}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggle(row.original.id)}>
              {row.original.status === "active" ? "Nonaktifkan" : "Aktifkan"}
            </DropdownMenuItem>
            <DeleteConfirmDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
                  Hapus
                </DropdownMenuItem>
              }
              onConfirm={() => handleDelete(row.original.id)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Iklan</h1>
          <p className="text-sm text-muted-foreground">Kelola banner dan iklan yang tampil di website</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="advertisements" steps={advertisementsSteps} />
          <Button asChild data-tour="ads-add">
            <Link href="/admin/advertisements/new">
              <Plus />
              Tambah Iklan
            </Link>
          </Button>
        </div>
      </div>

      <div data-tour="ads-table">
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setIsLoading(true);
          setPage(nextPage);
        }}
        emptyMessage="Belum ada iklan."
        toolbar={
          <Select
            value={placement}
            onValueChange={(value) => {
              setIsLoading(true);
              setPage(1);
              setPlacement(value);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Penempatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Penempatan</SelectItem>
              {Object.entries(PLACEMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      </div>
    </div>
  );
}
