"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, User } from "lucide-react";
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
import { apiSend } from "@/lib/fetcher";

type PelajarRow = {
  id: number;
  jantina: "lelaki" | "perempuan";
  nama: string;
  tingkatan: string;
  dorm: string;
  noWaris: string | null;
  foto: string | null;
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
  const [search, setSearch] = useState("");
  const [jantina, setJantina] = useState("all");

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    if (jantina !== "all") params.set("jantina", jantina);
    fetchPelajar(params)
      .then(({ rows, totalPages }) => { setRows(rows); setTotalPages(totalPages); })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [page, jantina]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <Input
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setIsLoading(true); load(); } }}
              className="max-w-xs"
            />
            <Select value={jantina} onValueChange={(v) => { setIsLoading(true); setPage(1); setJantina(v); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Jantina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="lelaki">Aspura (Lelaki)</SelectItem>
                <SelectItem value="perempuan">Aspuri (Perempuan)</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
      </div>
    </div>
  );
}
