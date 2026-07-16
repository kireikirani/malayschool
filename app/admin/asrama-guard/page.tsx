"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { createAsramaGuardSchema, updateAsramaGuardSchema } from "@/lib/validations/asrama-guard.schema";
import { apiSend } from "@/lib/fetcher";

type GuardRow = {
  id: number;
  userId: string;
  nama: string;
  noTelefon: string | null;
  status: "active" | "inactive";
  email: string | null;
  createdAt: string;
};

type CreateValues = z.infer<typeof createAsramaGuardSchema>;
type UpdateValues = z.infer<typeof updateAsramaGuardSchema>;

export default function AdminGuardPage() {
  const [rows, setRows] = useState<GuardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<GuardRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createAsramaGuardSchema),
    defaultValues: {
      email: "",
      password: "",
      nama: "",
      noTelefon: "",
    },
  });

  const editForm = useForm<UpdateValues>({
    resolver: zodResolver(updateAsramaGuardSchema),
    defaultValues: {
      nama: "",
      noTelefon: "",
      status: "active",
    },
  });

  async function loadGuards() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/asrama-guard?limit=100");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
      setRows(body.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ralat memuat data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGuards(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function openAdd() {
    createForm.reset({
      email: "",
      password: "",
      nama: "",
      noTelefon: "",
    });
    setDialogOpen(true);
  }

  function openEdit(row: GuardRow) {
    setEditing(row);
    editForm.reset({
      nama: row.nama,
      noTelefon: row.noTelefon ?? "",
      status: row.status,
    });
    setEditOpen(true);
  }

  async function onCreateSubmit(values: CreateValues) {
    setIsSubmitting(true);
    try {
      await apiSend("/api/admin/asrama-guard", "POST", values);
      toast.success("Pengawal asrama ditambahkan dan akaun dicipta");
      setDialogOpen(false);
      loadGuards();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah pengawal");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onEditSubmit(values: UpdateValues) {
    if (!editing) return;
    setIsSubmitting(true);
    try {
      await apiSend(`/api/admin/asrama-guard/${editing.id}`, "PATCH", values);
      toast.success("Maklumat pengawal dikemaskini");
      setEditOpen(false);
      loadGuards();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan maklumat");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/asrama-guard/${id}`, "DELETE");
      toast.success("Pengawal dipadam beserta akaun log masuk");
      loadGuards();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam pengawal");
    }
  }

  const columns: ColumnDef<GuardRow, unknown>[] = [
    { accessorKey: "nama", header: "Nama Pengawal" },
    { accessorKey: "email", header: "Email Log Masuk", cell: ({ row }) => row.original.email ?? "—" },
    { accessorKey: "noTelefon", header: "No. Telefon", cell: ({ row }) => row.original.noTelefon ?? "—" },
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
            <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
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
          <h1 className="text-2xl font-bold">Pengawal / Satpam Asrama</h1>
          <p className="text-sm text-muted-foreground">Urus akaun pengawal keselamatan yang bertugas merekod pelajar keluar.</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 size-4" /> Daftar Pengawal</Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        emptyMessage="Belum ada pengawal berdaftar. Klik 'Daftar Pengawal' untuk bermula."
      />

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Daftar Pengawal Asrama Baru</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField control={createForm.control} name="nama" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Penuh</FormLabel>
                  <FormControl><Input placeholder="Contoh: Encik Kassim bin Selamat" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="kassim@gmail.com" {...field} /></FormControl>
                  <FormDescription>Digunakan oleh pengawal untuk log masuk.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Laluan</FormLabel>
                  <FormControl><Input type="password" placeholder="Min 8 aksara" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="noTelefon" render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telefon</FormLabel>
                  <FormControl><Input placeholder="Contoh: 013456789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Mendaftar..." : "Daftar"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Maklumat Pengawal</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField control={editForm.control} name="nama" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Penuh</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="noTelefon" render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Telefon</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Akaun</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={isSubmitting}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
