"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { MoreHorizontal, Plus, User } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { createAsramaWardenSchema } from "@/lib/validations/asrama-warden.schema";
import { apiSend } from "@/lib/fetcher";

type WardenRow = {
  id: number;
  teacherId: string;
  jawatan: string;
  sortOrder: number;
  teacherName: string | null;
  teacherPhoto: string | null;
};

type TeacherOption = {
  id: string;
  name: string;
  position: string | null;
  photo: string | null;
};

type CreateValues = z.input<typeof createAsramaWardenSchema>;

async function fetchWardens(): Promise<WardenRow[]> {
  const res = await fetch("/api/admin/asrama-warden?limit=100");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

async function fetchTeachers(): Promise<TeacherOption[]> {
  const res = await fetch("/api/teachers?limit=200");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat guru");
  return body.data;
}

function WardenForm({
  warden,
  teachers,
  onSuccess,
  onClose,
}: {
  warden?: WardenRow;
  teachers: TeacherOption[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createAsramaWardenSchema),
    defaultValues: {
      teacherId: warden?.teacherId ?? "",
      jawatan: warden?.jawatan ?? "Warden",
      sortOrder: warden?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: CreateValues) {
    setIsSubmitting(true);
    try {
      if (warden) {
        await apiSend(`/api/admin/asrama-warden/${warden.id}`, "PATCH", values);
        toast.success("Warden dikemaskini");
      } else {
        await apiSend("/api/admin/asrama-warden", "POST", values);
        toast.success("Warden ditambahkan");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="teacherId" render={({ field }) => (
          <FormItem>
            <FormLabel>Guru / Staf</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru yang telah didaftarkan" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-72">
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}{t.position ? ` — ${t.position}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Guru mesti didaftarkan terlebih dahulu di menu Guru.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jawatan" render={({ field }) => (
          <FormItem>
            <FormLabel>Jawatan Warden</FormLabel>
            <FormControl><Input placeholder="Contoh: Penyelia Asrama (Lelaki)" {...field} /></FormControl>
            <FormDescription>Jawatan yang dipaparkan di kad warden pada halaman Asrama.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="sortOrder" render={({ field }) => (
          <FormItem>
            <FormLabel>Urutan</FormLabel>
            <FormControl>
              <Input type="number" min={0} max={9999} {...field} value={field.value as number} onChange={(e) => field.onChange(Number(e.target.value))} className="w-32" />
            </FormControl>
            <FormDescription>Nombor lebih kecil dipapar dahulu.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
        </div>
      </form>
    </Form>
  );
}

export default function AsramaWardenPage() {
  const [rows, setRows] = useState<WardenRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WardenRow | undefined>(undefined);

  function load() {
    setIsLoading(true);
    Promise.all([fetchWardens(), fetchTeachers()])
      .then(([w, t]) => { setRows(w); setTeachers(t); })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(row: WardenRow) { setEditing(row); setDialogOpen(true); }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/asrama-warden/${id}`, "DELETE");
      toast.success("Warden dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  const columns: ColumnDef<WardenRow, unknown>[] = [
    {
      accessorKey: "sortOrder",
      header: "Urutan",
      cell: ({ row }) => (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {row.original.sortOrder}
        </span>
      ),
    },
    {
      id: "teacher",
      header: "Guru",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 overflow-hidden rounded-full border bg-muted">
            {row.original.teacherPhoto ? (
              <Image src={row.original.teacherPhoto} alt={row.original.teacherName ?? ""} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center"><User className="size-4 text-muted-foreground" /></div>
            )}
          </div>
          <span className="font-medium">{row.original.teacherName ?? "(Tiada nama)"}</span>
        </div>
      ),
    },
    { accessorKey: "jawatan", header: "Jawatan Warden" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit</DropdownMenuItem>
            <DeleteConfirmDialog
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">Hapus</DropdownMenuItem>
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
          <h1 className="text-2xl font-semibold">Warden Asrama</h1>
          <p className="text-sm text-muted-foreground">Pilih guru yang telah didaftarkan sebagai warden asrama. Profil (nama & foto) akan diambil daripada rekod guru.</p>
        </div>
        <Button onClick={openAdd}><Plus /> Tambah Warden</Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="Belum ada warden. Klik 'Tambah Warden' untuk mula."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Warden" : "Tambah Warden"}</DialogTitle>
          </DialogHeader>
          <WardenForm
            warden={editing}
            teachers={teachers}
            onSuccess={load}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
