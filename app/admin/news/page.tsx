"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTour } from "@/components/admin/tour/page-tour";
import { newsSteps } from "@/components/admin/tour/tour-steps";
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

type NewsRow = {
  id: string;
  title: string;
  status: "draft" | "published";
  publishDate: string | null;
  updatedAt: string;
};

type Paginated<T> = { rows: T[]; totalPages: number };

async function fetchNews(params: URLSearchParams): Promise<Paginated<NewsRow>> {
  const res = await fetch(`/api/news?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function NewsListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    if (status !== "all") params.set("status", status);
    fetchNews(params)
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
  }, [page, status]);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/news/${id}`, "DELETE");
      toast.success("Berita dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  const columns: ColumnDef<NewsRow, unknown>[] = [
    { accessorKey: "title", header: "Tajuk" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "publishDate",
      header: "Tarikh Terbit",
      cell: ({ row }) =>
        row.original.publishDate ? new Date(row.original.publishDate).toLocaleDateString("ms-MY") : "-",
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
            <DropdownMenuItem onClick={() => router.push(`/admin/news/${row.original.id}/preview`)}>
              Pratinjau
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/news/${row.original.id}/edit`)}>
              Edit
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
          <h1 className="text-2xl font-semibold">Berita</h1>
          <p className="text-sm text-muted-foreground">Kelola artikel dan pengumuman website sekolah</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="news" steps={newsSteps} />
          <Button asChild data-tour="news-add">
            <Link href="/admin/news/new">
              <Plus />
              Tambah Berita
            </Link>
          </Button>
        </div>
      </div>

      <div data-tour="news-table">
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
        emptyMessage="Belum ada berita."
        toolbar={
          <>
            <Input
              placeholder="Cari judul..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsLoading(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsLoading(true);
                  load();
                }
              }}
              className="max-w-xs"
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setIsLoading(true);
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draf</SelectItem>
                <SelectItem value="published">Diterbitkan</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
      </div>
    </div>
  );
}
