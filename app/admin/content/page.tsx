"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
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

type PublicContentRow = {
  id: number;
  pageKey: string;
  sectionKey: string;
  type: string;
  title: string | null;
  isActive: boolean;
  sortOrder: number;
};

async function fetchContent(): Promise<PublicContentRow[]> {
  const res = await fetch("/api/admin/content?limit=100");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

export default function PublicContentPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PublicContentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function load() {
    setIsLoading(true);
    fetchContent()
      .then(setRows)
      .catch((error) => toast.error(error.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/content/${id}`, "DELETE");
      toast.success("Seksyen dipadam");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memadam");
    }
  }

  const columns: ColumnDef<PublicContentRow, unknown>[] = [
    { accessorKey: "pageKey", header: "Halaman" },
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
            <DropdownMenuItem onClick={() => router.push(`/admin/content/${row.original.id}/edit`)}>
              Edit
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Public Content</h1>
          <p className="text-sm text-muted-foreground">Hero, about, PIBG, links, and structured public sections.</p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus />
            Tambah Seksyen
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
        emptyMessage="Belum ada seksyen public content."
      />
    </div>
  );
}
