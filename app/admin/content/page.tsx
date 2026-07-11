"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp, MoreHorizontal, Plus } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { contentSteps } from "@/components/admin/tour/tour-steps";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

type PublicContentRow = {
  id: number;
  pageKey: string;
  sectionKey: string;
  type: string;
  title: string | null;
  isActive: boolean;
  sortOrder: number;
};

async function fetchContent(pageKey: string): Promise<PublicContentRow[]> {
  const query = pageKey === "all" ? "?limit=100" : `?pageKey=${pageKey}&limit=100`;
  const res = await fetch(`/api/admin/content${query}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

const PAGE_KEYS = ["home", "about", "asrama", "borang"];

export default function PublicContentPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PublicContentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageKey, setPageKey] = useState("all");

  function load(nextPageKey = pageKey) {
    fetchContent(nextPageKey)
      .then(setRows)
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load(pageKey);
  }, [pageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: number) {
    setIsLoading(true);
    try {
      await apiSend(`/api/admin/content/${id}`, "DELETE");
      toast.success("Seksyen dipadam");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memadam");
    }
  }

  async function shiftRow(row: PublicContentRow, direction: -1 | 1) {
    const pageRows = rows.filter((item) => item.pageKey === row.pageKey).sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = pageRows.findIndex((item) => item.id === row.id);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= pageRows.length) return;

    const swapped = [...pageRows];
    [swapped[currentIndex], swapped[targetIndex]] = [swapped[targetIndex], swapped[currentIndex]];

    try {
      await apiSend("/api/admin/content/reorder", "POST", swapped.map((item, index) => ({ id: item.id, sortOrder: index })));
      toast.success("Urutan dikemaskini");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menukar urutan");
    }
  }

  const columns: ColumnDef<PublicContentRow, unknown>[] = [
    { accessorKey: "pageKey", header: "Halaman" },
    { accessorKey: "sectionKey", header: "Section Key" },
    {
      accessorKey: "type",
      header: () => <span data-tour="section-type-col">Jenis</span>,
    },
    { accessorKey: "title", header: "Tajuk", cell: ({ row }) => row.original.title ?? "-" },
    {
      accessorKey: "isActive",
      header: () => <span data-tour="section-active-col">Aktif</span>,
      cell: ({ row }) => row.original.isActive ? "✓" : "—",
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
            <DropdownMenuItem onClick={() => router.push(`/admin/content/${row.original.id}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => shiftRow(row.original, -1)}>
              <ArrowDownUp className="size-4" />
              Naikkan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => shiftRow(row.original, 1)}>
              <ArrowDownUp className="size-4" />
              Turunkan
            </DropdownMenuItem>
            <DeleteConfirmDialog
              trigger={
                <DropdownMenuItem onSelect={(event) => event.preventDefault()} variant="destructive">
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

  const addHref = useMemo(() => {
    return pageKey === "all" ? "/admin/content/new" : `/admin/content/new?pageKey=${pageKey}`;
  }, [pageKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Public Content</h1>
          <p className="text-sm text-muted-foreground">Hero, about, PIBG, links, and structured public sections.</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="content-mgmt" steps={contentSteps} />
          <Button asChild data-tour="add-section">
            <Link href={addHref}>
              <Plus />
              Tambah Seksyen
            </Link>
          </Button>
        </div>
      </div>

      <div data-tour="content-table">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyMessage="Belum ada seksyen public content."
          toolbar={
            <div className="flex items-center gap-2">
              <Select value={pageKey} onValueChange={(v) => { setIsLoading(true); setPageKey(v); }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pilih Halaman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Halaman</SelectItem>
                  {PAGE_KEYS.map((pk) => (
                    <SelectItem key={pk} value={pk}>
                      {pk.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      </div>
    </div>
  );
}
