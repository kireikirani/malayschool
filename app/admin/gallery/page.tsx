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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { apiSend } from "@/lib/fetcher";

type AlbumRow = {
  id: string;
  name: string;
  itemCount: number;
};

async function fetchAlbums(params: URLSearchParams): Promise<{ rows: AlbumRow[]; totalPages: number }> {
  const res = await fetch(`/api/gallery/albums?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function GalleryAlbumsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AlbumRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    fetchAlbums(params)
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
  }, [page]);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/gallery/albums/${id}`, "DELETE");
      toast.success("Album dihapus");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  const columns: ColumnDef<AlbumRow, unknown>[] = [
    { accessorKey: "name", header: "Nama Album" },
    { accessorKey: "itemCount", header: "Jumlah Foto" },
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
            <DropdownMenuItem onClick={() => router.push(`/admin/gallery/${row.original.id}`)}>
              Kelola Foto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/gallery/${row.original.id}/edit`)}>
              Edit Album
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
          <h1 className="text-2xl font-semibold">Galeri</h1>
          <p className="text-sm text-muted-foreground">Kelola album dan foto galeri sekolah</p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/new">
            <Plus />
            Tambah Album
          </Link>
        </Button>
      </div>

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
        emptyMessage="Belum ada album."
        toolbar={
          <Input
            placeholder="Cari album..."
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
        }
      />
    </div>
  );
}
