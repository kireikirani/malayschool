"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
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
import { createAsramaFasilitiSchema, ALLOWED_FASILITI_ICONS } from "@/lib/validations/asrama-fasiliti.schema";
import { apiSend } from "@/lib/fetcher";

type IconName = typeof ALLOWED_FASILITI_ICONS[number];

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

type FasilitiRow = {
  id: number;
  iconName: string;
  label: string;
  sortOrder: number;
};

type CreateValues = z.input<typeof createAsramaFasilitiSchema>;

async function fetchFasiliti(): Promise<FasilitiRow[]> {
  const res = await fetch("/api/admin/asrama-fasiliti?limit=100");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

function FasilitiForm({
  fasiliti,
  onSuccess,
  onClose,
}: {
  fasiliti?: FasilitiRow;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createAsramaFasilitiSchema),
    defaultValues: {
      iconName: (fasiliti?.iconName ?? "BedDouble") as IconName,
      label: fasiliti?.label ?? "",
      sortOrder: fasiliti?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: CreateValues) {
    setIsSubmitting(true);
    try {
      if (fasiliti) {
        await apiSend(`/api/admin/asrama-fasiliti/${fasiliti.id}`, "PATCH", values);
        toast.success("Fasiliti dikemaskini");
      } else {
        await apiSend("/api/admin/asrama-fasiliti", "POST", values);
        toast.success("Fasiliti ditambahkan");
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
        <FormField control={form.control} name="iconName" render={({ field }) => (
          <FormItem>
            <FormLabel>Ikon</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih ikon">
                    {field.value && (
                      <span className="flex items-center gap-2">
                        <DynamicIcon name={field.value} className="size-4" />
                        {field.value}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-60">
                {ALLOWED_FASILITI_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    <span className="flex items-center gap-2">
                      <DynamicIcon name={icon} className="size-4" />
                      {icon}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Pilih ikon yang mewakili fasiliti ini. Ikon akan dipaparkan bersama label di laman asrama.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="label" render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl><Input placeholder="Contoh: Bilik Tidur" {...field} /></FormControl>
            <FormDescription>Nama fasiliti yang akan dipaparkan kepada pengunjung. Contoh: Bilik Tidur, Dewan Makan.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="sortOrder" render={({ field }) => (
          <FormItem>
            <FormLabel>Urutan</FormLabel>
            <FormControl>
              <Input type="number" min={0} max={9999} {...field} value={field.value as number} onChange={(e) => field.onChange(Number(e.target.value))} className="w-32" />
            </FormControl>
            <FormDescription>Nombor lebih kecil dipapar dahulu dalam senarai fasiliti.</FormDescription>
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

export default function AsramaFasilitiPage() {
  const [rows, setRows] = useState<FasilitiRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FasilitiRow | undefined>(undefined);

  function load() {
    setIsLoading(true);
    fetchFasiliti()
      .then(setRows)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(row: FasilitiRow) { setEditing(row); setDialogOpen(true); }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/asrama-fasiliti/${id}`, "DELETE");
      toast.success("Fasiliti dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  const columns: ColumnDef<FasilitiRow, unknown>[] = [
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
      accessorKey: "iconName",
      header: "Ikon",
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <DynamicIcon name={row.original.iconName} className="size-4 text-primary" />
          <span className="text-xs text-muted-foreground">{row.original.iconName}</span>
        </span>
      ),
    },
    { accessorKey: "label", header: "Label" },
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
          <h1 className="text-2xl font-semibold">Fasiliti Asrama</h1>
          <p className="text-sm text-muted-foreground">Urus senarai fasiliti yang tersedia di asrama</p>
        </div>
        <Button onClick={openAdd}><Plus /> Tambah Fasiliti</Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="Belum ada fasiliti. Klik 'Tambah Fasiliti' untuk mula."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Fasiliti" : "Tambah Fasiliti"}</DialogTitle>
          </DialogHeader>
          <FasilitiForm
            fasiliti={editing}
            onSuccess={load}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
