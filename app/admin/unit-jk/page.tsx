"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { ExternalLink, FileText, FolderOpen, Loader2, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { unitJkSteps } from "@/components/admin/tour/tour-steps";
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
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/admin/data-table";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { createUnitJkSchema } from "@/lib/validations/unit-jk.schema";
import { apiSend } from "@/lib/fetcher";

const UNIT_OPTIONS = [
  { value: "pentadbiran", label: "Pentadbiran" },
  { value: "kurikulum", label: "Kurikulum" },
  { value: "kokurikulum", label: "Kokurikulum" },
  { value: "hal-ehwal-murid", label: "Hal Ehwal Murid" },
  { value: "teknologi-maklumat", label: "Teknologi Maklumat" },
  { value: "bimbingan-kaunseling", label: "Bimbingan & Kaunseling" },
  { value: "asrama", label: "Asrama" },
] as const;

type UnitSlug = typeof UNIT_OPTIONS[number]["value"];

type JkRow = {
  id: number;
  unitSlug: string;
  jkCode: string;
  jkTitle: string;
  nama: string;
  jawatan: string;
  sortOrder: number;
};

type CreateValues = z.input<typeof createUnitJkSchema>;

async function fetchJk(unitSlug?: string): Promise<JkRow[]> {
  const params = new URLSearchParams({ limit: "200" });
  if (unitSlug && unitSlug !== "all") params.set("unitSlug", unitSlug);
  const res = await fetch(`/api/admin/unit-jk?${params}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

function JkForm({
  jk,
  defaultUnitSlug,
  onSuccess,
  onClose,
}: {
  jk?: JkRow;
  defaultUnitSlug?: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createUnitJkSchema),
    defaultValues: {
      unitSlug: (jk?.unitSlug ?? defaultUnitSlug ?? "pentadbiran") as UnitSlug,
      jkCode: jk?.jkCode ?? "",
      jkTitle: jk?.jkTitle ?? "",
      nama: jk?.nama ?? "",
      jawatan: jk?.jawatan ?? "",
      sortOrder: jk?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: CreateValues) {
    setIsSubmitting(true);
    try {
      if (jk) {
        await apiSend(`/api/admin/unit-jk/${jk.id}`, "PATCH", values);
        toast.success("Ahli JK dikemaskini");
      } else {
        await apiSend("/api/admin/unit-jk", "POST", values);
        toast.success("Ahli JK ditambahkan");
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
        <FormField control={form.control} name="unitSlug" render={({ field }) => (
          <FormItem>
            <FormLabel>Unit</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Pilih unit" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>Unit atau bahagian yang ahli JK ini mewakili.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jkCode" render={({ field }) => (
          <FormItem>
            <FormLabel>Kod JK</FormLabel>
            <FormControl><Input placeholder="Contoh: jk-pengurusan" {...field} /></FormControl>
            <FormDescription>Kod unik untuk kumpulkan ahli dalam jawatankuasa yang sama. Gunakan huruf kecil dan tanda sempang.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jkTitle" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Jawatankuasa</FormLabel>
            <FormControl><Input placeholder="Contoh: Jawatankuasa Pengurusan" {...field} /></FormControl>
            <FormDescription>Nama penuh jawatankuasa. Semua ahli dengan Kod JK yang sama akan dipaparkan bersama di bawah nama ini.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="nama" render={({ field }) => (
          <FormItem>
            <FormLabel>Nama Ahli</FormLabel>
            <FormControl><Input placeholder="Nama penuh" {...field} /></FormControl>
            <FormDescription>Nama penuh ahli jawatankuasa.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="jawatan" render={({ field }) => (
          <FormItem>
            <FormLabel>Jawatan dalam JK</FormLabel>
            <FormControl><Input placeholder="Contoh: Pengerusi" {...field} /></FormControl>
            <FormDescription>Contoh: Pengerusi, Naib Pengerusi, Setiausaha, Ahli.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="sortOrder" render={({ field }) => (
          <FormItem>
            <FormLabel>Urutan</FormLabel>
            <FormControl>
              <Input type="number" min={0} max={9999} {...field} value={field.value as number} onChange={(e) => field.onChange(Number(e.target.value))} className="w-32" />
            </FormControl>
            <FormDescription>Nombor lebih kecil dipapar dahulu dalam senarai ahli JK.</FormDescription>
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

// ── JK Document Management ──────────────────────────────────────────────────

type JkDocRow = {
  id: number;
  unitSlug: string;
  jkCode: string;
  label: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc" | "link";
  tahun: string | null;
  isVisible: boolean;
  sortOrder: number;
};

const FILE_TYPE_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Word / Doc" },
  { value: "image", label: "Imej" },
  { value: "link", label: "Pautan / Google Drive" },
] as const;

function JkDocsDialog({
  open,
  onClose,
  jk,
}: {
  open: boolean;
  onClose: () => void;
  jk: JkRow | null;
}) {
  const [docs, setDocs] = useState<JkDocRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState<"pdf" | "image" | "doc" | "link">("pdf");
  const [tahun, setTahun] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDocs = useCallback(() => {
    if (!jk) return;
    setLoading(true);
    fetch(`/api/unit-jk-docs?unitSlug=${jk.unitSlug}&jkCode=${encodeURIComponent(jk.jkCode)}&limit=100`)
      .then((res) => res.json())
      .then((body) => { if (Array.isArray(body.data)) setDocs(body.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jk]);

  useEffect(() => {
    if (open && jk) loadDocs();
    else { setDocs([]); setLabel(""); setUrl(""); setFileType("pdf"); setTahun(""); }
  }, [open, jk, loadDocs]);

  async function handleAdd() {
    if (!jk || !label.trim() || !url.trim()) {
      return;
    }
    setSaving(true);
    try {
      await apiSend("/api/unit-jk-docs", "POST", {
        unitSlug: jk.unitSlug,
        jkCode: jk.jkCode,
        label: label.trim(),
        fileUrl: url.trim(),
        fileType,
        tahun: tahun.trim() || undefined,
        isVisible: true,
        sortOrder: docs.length,
      });
      setLabel(""); setUrl(""); setFileType("pdf"); setTahun("");
      loadDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/unit-jk-docs/${id}`, "DELETE");
      loadDocs();
    } catch (err) {
      console.error(err);
    }
  }

  if (!jk) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="size-4 text-primary" />
            Dokumen — {jk.jkTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Existing docs list */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : docs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada dokumen untuk jawatankuasa ini.
            </p>
          ) : (
            docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 border border-border/60 bg-card px-3 py-2">
                <FileText className="size-4 shrink-0 text-primary/70" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{doc.label}</p>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="size-3" />
                    <span className="truncate max-w-[280px]">{doc.fileUrl}</span>
                  </a>
                </div>
                {doc.tahun && <span className="text-xs text-muted-foreground shrink-0">{doc.tahun}</span>}
                <DeleteConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon-sm" className="shrink-0">
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  }
                  onConfirm={() => handleDelete(doc.id)}
                />
              </div>
            ))
          )}
        </div>

        {/* Add new doc form */}
        <div className="border-t border-border/60 pt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tambah Dokumen</p>
          <div className="grid gap-2">
            <div>
              <Label className="text-xs">Tajuk Dokumen *</Label>
              <Input
                placeholder="Contoh: Minit Mesyuarat Bil. 1/2025"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div>
                <Label className="text-xs">URL / Google Drive Link *</Label>
                <Input
                  placeholder="https://drive.google.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Jenis</Label>
                <Select value={fileType} onValueChange={(v) => setFileType(v as typeof fileType)}>
                  <SelectTrigger className="mt-1 h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Tahun (pilihan)</Label>
              <Input
                placeholder="2025"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                maxLength={10}
                className="mt-1 h-8 w-28 text-xs"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={saving || !label.trim() || !url.trim()}
            className="gap-1.5"
          >
            {saving ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
            Tambah
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function UnitJkPage() {
  const [rows, setRows] = useState<JkRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JkRow | undefined>(undefined);
  const [docsJk, setDocsJk] = useState<JkRow | null>(null);

  function load() {
    setIsLoading(true);
    fetchJk(unitFilter)
      .then(setRows)
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [unitFilter]);

  function openAdd() { setEditing(undefined); setDialogOpen(true); }
  function openEdit(row: JkRow) { setEditing(row); setDialogOpen(true); }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/unit-jk/${id}`, "DELETE");
      toast.success("Ahli JK dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  const columns: ColumnDef<JkRow, unknown>[] = [
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
      accessorKey: "unitSlug",
      header: "Unit",
      cell: ({ row }) => UNIT_OPTIONS.find((u) => u.value === row.original.unitSlug)?.label ?? row.original.unitSlug,
    },
    { accessorKey: "jkTitle", header: "Jawatankuasa" },
    { accessorKey: "nama", header: "Nama Ahli" },
    { accessorKey: "jawatan", header: "Jawatan" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>Edit Ahli</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDocsJk(row.original)} className="gap-2">
              <FolderOpen className="size-3.5" />
              Dokumen JK
            </DropdownMenuItem>
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
          <h1 className="text-2xl font-semibold">Jawatankuasa (JK)</h1>
          <p className="text-sm text-muted-foreground">Urus ahli jawatankuasa semua unit dan asrama</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="unit-jk" steps={unitJkSteps} />
          <Button onClick={openAdd} data-tour="jk-add"><Plus /> Tambah Ahli JK</Button>
        </div>
      </div>

      <div data-tour="jk-table">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          page={1}
          totalPages={1}
          onPageChange={() => {}}
          emptyMessage="Belum ada ahli JK untuk unit ini."
          toolbar={
            <div data-tour="jk-unit-filter">
              <Select value={unitFilter} onValueChange={(v) => { setUnitFilter(v); setIsLoading(true); }}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Semua Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Ahli JK" : "Tambah Ahli JK"}</DialogTitle>
          </DialogHeader>
          <JkForm
            jk={editing}
            defaultUnitSlug={unitFilter !== "all" ? unitFilter : undefined}
            onSuccess={load}
            onClose={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <JkDocsDialog
        open={docsJk !== null}
        onClose={() => setDocsJk(null)}
        jk={docsJk}
      />
    </div>
  );
}
