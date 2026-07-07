"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowDownUp, MoreHorizontal, Plus } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { unitsSteps } from "@/components/admin/tour/tour-steps";
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
import { UNITS } from "@/lib/units";

type UnitSectionRow = {
  id: number;
  unitSlug: string;
  sectionKey: string;
  type: string;
  title: string | null;
  sortOrder: number;
};

async function fetchSections(unitSlug: string): Promise<UnitSectionRow[]> {
  const query = unitSlug === "all" ? "?limit=200" : `?unitSlug=${unitSlug}&limit=200`;
  const res = await fetch(`/api/admin/units${query}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

export default function UnitSectionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<UnitSectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unitSlug, setUnitSlug] = useState("all");

  function load(nextUnitSlug = unitSlug) {
    setIsLoading(true);
    fetchSections(nextUnitSlug)
      .then(setRows)
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load(unitSlug);
  }, [unitSlug]);

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/units/${id}`, "DELETE");
      toast.success("Seksyen dipadam");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memadam");
    }
  }

  async function shiftRow(row: UnitSectionRow, direction: -1 | 1) {
    const unitRows = rows.filter((item) => item.unitSlug === row.unitSlug).sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = unitRows.findIndex((item) => item.id === row.id);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= unitRows.length) return;

    const swapped = [...unitRows];
    [swapped[currentIndex], swapped[targetIndex]] = [swapped[targetIndex], swapped[currentIndex]];

    try {
      await apiSend("/api/admin/units/reorder", "POST", swapped.map((item, index) => ({ id: item.id, sortOrder: index })));
      toast.success("Urutan dikemaskini");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menukar urutan");
    }
  }

  const columns: ColumnDef<UnitSectionRow, unknown>[] = [
    { accessorKey: "unitSlug", header: "Unit" },
    { accessorKey: "sectionKey", header: "Section Key" },
    { accessorKey: "type", header: "Jenis" },
    { accessorKey: "title", header: "Tajuk", cell: ({ row }) => row.original.title ?? "-" },
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
            <DropdownMenuItem onClick={() => router.push(`/admin/units/${row.original.id}/edit`)}>
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
    return unitSlug === "all" ? "/admin/units/new" : `/admin/units/new?unitSlug=${unitSlug}`;
  }, [unitSlug]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Unit Sections</h1>
          <p className="text-sm text-muted-foreground">Kelola susunan seksyen bagi setiap unit pengurusan.</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="units" steps={unitsSteps} />
          <Button asChild data-tour="units-add">
            <Link href={addHref}>
              <Plus />
              Tambah Seksyen
            </Link>
          </Button>
        </div>
      </div>

      <div data-tour="units-table">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyMessage="Belum ada seksyen unit."
          toolbar={
            <div data-tour="units-filter">
              <Select value={unitSlug} onValueChange={setUnitSlug}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Pilih unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit.slug} value={unit.slug}>
                      {unit.navLabel}
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
