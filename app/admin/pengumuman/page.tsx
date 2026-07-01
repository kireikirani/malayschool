"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { apiSend } from "@/lib/fetcher";

type PengumumanRow = {
  id: number;
  tajuk: string;
  imageUrl: string;
  aktif: boolean;
  tamatPada: string | null;
  sortOrder: number;
};

async function fetchPengumuman(): Promise<PengumumanRow[]> {
  const res = await fetch("/api/pengumuman?limit=100");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

export default function PengumumanListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PengumumanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    setIsLoading(true);
    fetchPengumuman()
      .then(setRows)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/pengumuman/${id}`, "DELETE");
      toast.success("Pengumuman dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam");
    }
  }

  const columns: ColumnDef<PengumumanRow, unknown>[] = [
    {
      id: "poster",
      header: "Poster",
      cell: ({ row }) => (
        <div className="relative size-14 overflow-hidden rounded border">
          <Image src={row.original.imageUrl} alt={row.original.tajuk} fill className="object-cover" />
        </div>
      ),
    },
    { accessorKey: "tajuk", header: "Tajuk" },
    {
      accessorKey: "aktif",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.aktif ? "default" : "secondary"}>
          {row.original.aktif ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    },
    {
      accessorKey: "tamatPada",
      header: "Tamat",
      cell: ({ row }) =>
        row.original.tamatPada
          ? new Date(row.original.tamatPada).toLocaleDateString("ms-MY")
          : "—",
    },
    { accessorKey: "sortOrder", header: "Urutan" },
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
            <DropdownMenuItem onClick={() => router.push(`/admin/pengumuman/${row.original.id}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DeleteConfirmDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
                  Padam
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
          <h1 className="text-2xl font-semibold">Pengumuman</h1>
          <p className="text-sm text-muted-foreground">Info terkini dan poster yang dipaparkan di laman utama</p>
        </div>
        <Button asChild>
          <Link href="/admin/pengumuman/new">
            <Plus />
            Tambah Pengumuman
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="Belum ada pengumuman."
      />
    </div>
  );
}
