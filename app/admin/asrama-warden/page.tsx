"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { asramaWardenSteps } from "@/components/admin/tour/tour-steps";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ImagePicker } from "@/components/admin/image-picker";
import { createAsramaWardenSchema } from "@/lib/validations/asrama-warden.schema";
import { apiSend } from "@/lib/fetcher";

type WardenRow = {
  id: number;
  nama: string;
  jawatan: string;
  telefon: string | null;
  foto: string | null;
  sortOrder: number;
};

type CreateValues = z.input<typeof createAsramaWardenSchema>;

async function fetchWardens(): Promise<WardenRow[]> {
  const res = await fetch("/api/admin/asrama-warden?limit=100");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

function WardenForm({
  warden,
  onSuccess,
  onClose,
}: {
  warden?: WardenRow;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createAsramaWardenSchema),
    defaultValues: {
      nama: warden?.nama ?? "",
      jawatan: warden?.jawatan ?? "",
      telefon: warden?.telefon ?? "",
      foto: warden?.foto ?? undefined,
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
        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama</FormLabel>
            <FormControl><Input placeholder="Nama warden" {...field} /></FormControl>
            <FormDescription>Nama penuh warden seperti yang akan dipaparkan di laman web.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jawatan" render={({ field }) => (
          <FormItem>
            <FormLabel>Jawatan</FormLabel>
            <FormControl><Input placeholder="Contoh: Ketua Warden" {...field} /></FormControl>
            <FormDescription>Contoh: Ketua Warden, Warden Lelaki, Warden Perempuan.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="telefon" render={({ field }) => (
          <FormItem>
            <FormLabel>Telefon (pilihan)</FormLabel>
            <FormControl><Input placeholder="01x-xxxxxxx" {...field} value={(field.value as string | undefined) ?? ""} /></FormControl>
            <FormDescription>Nombor telefon yang akan dipaparkan dan boleh diklik untuk call atau WhatsApp.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="foto" render={({ field }) => (
          <FormItem>
            <FormLabel>Foto (pilihan)</FormLabel>
            <FormControl>
              <ImagePicker value={(field.value as string | undefined) ?? undefined} onChange={field.onChange} />
            </FormControl>
            <FormDescription>Gambar profil warden. Saiz disyorkan: 400×400 piksel.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="sortOrder" render={({ field }) => (
          <FormItem>
            <FormLabel>Urutan</FormLabel>
            <FormControl>
              <Input type="number" min={0} max={9999} {...field} value={field.value as number} onChange={(e) => field.onChange(Number(e.target.value))} className="w-32" />
            </FormControl>
            <FormDescription>Nombor lebih kecil dipapar dahulu. Guna 0, 1, 2… untuk susun atur warden.</FormDescription>
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
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WardenRow | undefined>(undefined);

  function load() {
    setIsLoading(true);
    fetchWardens()
      .then(setRows)
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
      header: () => <span data-tour="warden-sort">Urutan</span>,
      cell: ({ row }) => (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {row.original.sortOrder}
        </span>
      ),
    },
    { accessorKey: "nama", header: "Nama" },
    { accessorKey: "jawatan", header: "Jawatan" },
    { accessorKey: "telefon", header: "Telefon", cell: ({ row }) => row.original.telefon ?? "-" },
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
          <p className="text-sm text-muted-foreground">Urus senarai warden asrama sekolah</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="asrama-warden" steps={asramaWardenSteps} />
          <Button onClick={openAdd} data-tour="warden-add"><Plus /> Tambah Warden</Button>
        </div>
      </div>

      <div data-tour="warden-table">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyMessage="Belum ada warden. Klik 'Tambah Warden' untuk mula."
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Warden" : "Tambah Warden"}</DialogTitle>
          </DialogHeader>
          <WardenForm
            warden={editing}
            onSuccess={load}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
