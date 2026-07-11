"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, ShieldAlert } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTour } from "@/components/admin/tour/page-tour";
import { teachersSteps } from "@/components/admin/tour/tour-steps";
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

type TeacherRow = {
  id: string;
  name: string;
  position: string | null;
  sortOrder: number;
  status: "active" | "inactive";
};

async function fetchTeachers(params: URLSearchParams): Promise<{ rows: TeacherRow[]; totalPages: number }> {
  const res = await fetch(`/api/teachers?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function TeachersListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [pendingCount, setPendingCount] = useState(0);

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("q", search);
    if (status !== "all") params.set("status", status);
    fetchTeachers(params)
      .then(({ rows, totalPages }) => {
        setRows(rows);
        setTotalPages(totalPages);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));

    // Fetch pending count
    fetch("/api/admin/pending-teachers")
      .then((res) => res.json())
      .then((body) => {
        if (body.data) {
          setPendingCount(body.data.length);
        }
      })
      .catch((err) => console.error(err));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/teachers/${id}`, "DELETE");
      toast.success("Guru dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  async function handleToggle(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/teachers/${id}/toggle-status`, "PATCH");
      toast.success("Status dikemaskini");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui status");
    }
  }

  const columns: ColumnDef<TeacherRow, unknown>[] = [
    {
      accessorKey: "sortOrder",
      header: "Urutan",
      cell: ({ row }) => (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {row.original.sortOrder}
        </span>
      ),
    },
    { accessorKey: "name", header: "Nama" },
    { accessorKey: "position", header: "Jawatan", cell: ({ row }) => row.original.position ?? "-" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
            <DropdownMenuItem onClick={() => router.push(`/admin/teachers/${row.original.id}/edit`)}>
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
          <h1 className="text-2xl font-semibold">Guru</h1>
          <p className="text-sm text-muted-foreground">Kelola data dan status guru sekolah</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="teachers" steps={teachersSteps} />
          <Button asChild data-tour="teachers-add">
            <Link href="/admin/teachers/new">
              <Plus />
              Tambah Guru
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert banner if there are pending teachers */}
      {pendingCount > 0 && (
        <Alert variant="default" className="border-amber-500 bg-amber-500/5 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold">Pendaftaran Guru Menunggu Kelulusan</AlertTitle>
          <AlertDescription className="text-amber-800/90 dark:text-amber-300/90 flex flex-wrap items-center justify-between gap-3 pt-1">
            <span>Terdapat {pendingCount} pendaftaran guru baharu yang sedang menunggu kelulusan anda.</span>
            <Button size="sm" asChild className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white border-0">
              <Link href="/admin/dashboard">Urus Kelulusan di Dashboard</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div data-tour="teachers-table">
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
        emptyMessage="Belum ada data guru."
        toolbar={
          <>
            <Input
              placeholder="Cari nama..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />
      </div>
    </div>
  );
}
