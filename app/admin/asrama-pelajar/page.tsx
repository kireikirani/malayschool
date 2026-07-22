"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, User, X } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { asramaPelajarSteps } from "@/components/admin/tour/tour-steps";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { TingkatanSelect } from "@/components/public/tingkatan-select";
import { apiSend } from "@/lib/fetcher";

type PelajarRow = {
  id: number;
  jantina: "lelaki" | "perempuan";
  nama: string;
  tingkatan: string;
  dorm: string;
  noWaris: string | null;
  namaWaris: string | null;
  noWaris2: string | null;
  namaWaris2: string | null;
  noWaris3: string | null;
  namaWaris3: string | null;
  foto: string | null;
  gdriveFolderLink: string | null;
  status: "active" | "inactive";
};

async function fetchPelajar(params: URLSearchParams): Promise<{ rows: PelajarRow[]; totalPages: number }> {
  const res = await fetch(`/api/asrama-pelajar?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function AsramaPelajarPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PelajarRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [search, setSearch] = useState("");
  const [dormSearch, setDormSearch] = useState("");
  const [jantina, setJantina] = useState<"" | "lelaki" | "perempuan">("");
  const [tingkatan, setTingkatan] = useState("all");
  const [status, setStatus] = useState("all");

  function buildParams() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    if (dormSearch) params.set("dorm", dormSearch);
    if (jantina) params.set("jantina", jantina);
    if (tingkatan !== "all") params.set("tingkatan", tingkatan);
    if (status !== "all") params.set("status", status);
    return params;
  }

  function load() {
    fetchPelajar(buildParams())
      .then(({ rows, totalPages }) => { setRows(rows); setTotalPages(totalPages); })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [page, jantina, tingkatan, status]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { setIsLoading(true); setPage(1); load(); }
  }

  function handleClearFilters() {
    setSearch("");
    setDormSearch("");
    setJantina("");
    setTingkatan("all");
    setStatus("all");
    setPage(1);
  }

  const hasActiveFilters = search || dormSearch || jantina || tingkatan !== "all" || status !== "all";

  async function handleDelete(id: number) {
    setIsLoading(true);
    try {
      await apiSend(`/api/asrama-pelajar/${id}`, "DELETE");
      toast.success("Rekod dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam");
    }
  }

  const columns: ColumnDef<PelajarRow, unknown>[] = [
    {
      id: "foto",
      header: "Foto",
      cell: ({ row }) =>
        row.original.foto ? (
          <div className="relative size-9 overflow-hidden rounded-full border">
            <Image src={row.original.foto} alt={row.original.nama} fill className="object-cover" />
          </div>
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-muted">
            <User className="size-4 text-muted-foreground" />
          </span>
        ),
    },
    { accessorKey: "nama", header: "Nama" },
    { accessorKey: "tingkatan", header: "Tingkatan" },
    { accessorKey: "dorm", header: "Dorm" },
    { accessorKey: "noWaris", header: "No. Waris", cell: ({ row }) => row.original.noWaris ?? "—" },
    {
      accessorKey: "jantina",
      header: "Jantina",
      cell: ({ row }) => (
        <Badge variant={row.original.jantina === "lelaki" ? "default" : "secondary"}>
          {row.original.jantina === "lelaki" ? "Aspura" : "Aspuri"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "outline"}>
          {row.original.status === "active" ? "Aktif" : "Tidak Aktif"}
        </Badge>
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
            <DropdownMenuItem onClick={() => router.push(`/admin/asrama-pelajar/${row.original.id}/edit`)}>
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
          <h1 className="text-2xl font-semibold">Pelajar Asrama</h1>
          <p className="text-sm text-muted-foreground">Senarai aspura dan aspuri penghuni asrama sekolah</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="asrama-pelajar" steps={asramaPelajarSteps} />
          <Button asChild data-tour="pelajar-add">
            <Link href="/admin/asrama-pelajar/new">
              <Plus />
              Tambah Pelajar
            </Link>
          </Button>
        </div>
      </div>

      <div data-tour="pelajar-table">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => { setIsLoading(true); setPage(p); }}
          emptyMessage="Belum ada rekod pelajar asrama."
          toolbar={
            <>
              {/* Name search */}
              <Input
                placeholder="Cari nama pelajar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="max-w-xs"
              />

              {/* Dorm search */}
              <Input
                placeholder="Cari asrama/dorm..."
                value={dormSearch}
                onChange={(e) => setDormSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="max-w-[180px]"
              />

              {/* Tingkatan filter */}
              <TingkatanSelect
                value={tingkatan}
                onValueChange={(v) => { setIsLoading(true); setPage(1); setTingkatan(v); }}
                className="w-[160px]"
              />

              {/* Status filter */}
              <Select value={status} onValueChange={(v) => { setIsLoading(true); setPage(1); setStatus(v); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>

              {/* Gender toggle buttons */}
              <div className="flex items-center rounded-md border bg-muted/40 p-0.5 gap-0.5">
                <Button
                  variant={jantina === "" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => { setIsLoading(true); setPage(1); setJantina(""); }}
                >
                  Semua
                </Button>
                <Button
                  variant={jantina === "lelaki" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => { setIsLoading(true); setPage(1); setJantina(jantina === "lelaki" ? "" : "lelaki"); }}
                >
                  Aspura
                </Button>
                <Button
                  variant={jantina === "perempuan" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => { setIsLoading(true); setPage(1); setJantina(jantina === "perempuan" ? "" : "perempuan"); }}
                >
                  Aspuri
                </Button>
              </div>

              {/* Clear all filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={handleClearFilters}
                >
                  <X className="size-3.5" />
                  Kosongkan
                </Button>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
