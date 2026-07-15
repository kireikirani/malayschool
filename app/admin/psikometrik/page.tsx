"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { PsikometrikImport } from "./_components/psikometrik-import";
import { apiSend } from "@/lib/fetcher";

type PsikometrikRow = {
  id: number;
  noPengenalan: string;
  namaMurid: string;
  namaKelas: string | null;
  namaSekolah: string | null;
  tarikh: string | null;
};

async function fetchRows(params: URLSearchParams): Promise<{ rows: PsikometrikRow[]; totalPages: number }> {
  const res = await fetch(`/api/admin/psikometrik?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function PsikometrikAdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PsikometrikRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  function buildParams() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    return params;
  }

  const load = useCallback(() => {
    setIsLoading(true);
    fetchRows(buildParams())
      .then(({ rows, totalPages }) => { setRows(rows); setTotalPages(totalPages); })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { setPage(1); load(); }
  }

  async function handleDelete(id: number) {
    setIsLoading(true);
    try {
      await apiSend(`/api/admin/psikometrik/${id}`, "DELETE");
      toast.success("Rekod dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam");
      setIsLoading(false);
    }
  }

  const columns: ColumnDef<PsikometrikRow, unknown>[] = [
    {
      accessorKey: "noPengenalan",
      header: "No. Pengenalan",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.noPengenalan}</span>,
    },
    { accessorKey: "namaMurid", header: "Nama Murid" },
    { accessorKey: "namaKelas", header: "Kelas", cell: ({ row }) => row.original.namaKelas ?? "—" },
    { accessorKey: "namaSekolah", header: "Sekolah", cell: ({ row }) => row.original.namaSekolah ?? "—" },
    { accessorKey: "tarikh", header: "Tarikh", cell: ({ row }) => row.original.tarikh ?? "—" },
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
            <DropdownMenuItem onClick={() => router.push(`/admin/psikometrik/${row.original.id}/edit`)}>
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
          <h1 className="text-2xl font-semibold">Rekod Psikometrik</h1>
          <p className="text-sm text-muted-foreground">Urus keputusan Inventori Tret Personaliti (ITP) pelajar</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="size-4" />
                Import Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Rekod dari Excel</DialogTitle>
                <DialogDescription>
                  Muat naik fail Excel untuk import data psikometrik secara pukal. Rekod sedia ada akan dikemaskini berdasarkan No. Pengenalan.
                </DialogDescription>
              </DialogHeader>
              <PsikometrikImport
                onSuccess={() => { setImportOpen(false); load(); }}
              />
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link href="/admin/psikometrik/new">
              <Plus />
              Tambah Rekod
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => { setIsLoading(true); setPage(p); }}
        emptyMessage="Belum ada rekod psikometrik."
        toolbar={
          <>
            <Input
              placeholder="Cari nama atau no. pengenalan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="max-w-xs"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearch(""); setPage(1); load(); }}
              >
                <X className="size-3.5" />
                Kosongkan
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}
