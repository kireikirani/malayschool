"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCw, CheckCircle2, Clock, ExternalLink, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { PageTour } from "@/components/admin/tour/page-tour";
import { ubkDashboardSteps } from "@/components/admin/tour/tour-steps";
import { apiSend } from "@/lib/fetcher";
import Link from "next/link";

const TINGKATAN_OPTIONS = [
  "Tingkatan 1",
  "Tingkatan 2",
  "Tingkatan 3",
  "Tingkatan 4",
  "Tingkatan 5",
  "Tingkatan 6",
];

type UbkLink = {
  id: number;
  tingkatan: string;
  label: string | null;
  sheetUrl: string;
  lastImportedAt: string | null;
  lastImportCount: number | null;
};

type ImportResult = { inserted: number; updated: number; message: string };

const grouped = (rows: UbkLink[]) =>
  TINGKATAN_OPTIONS.reduce<Record<string, UbkLink[]>>((acc, t) => {
    acc[t] = rows.filter((r) => r.tingkatan === t);
    return acc;
  }, {});

export default function UbkAdminPage() {
  const [rows, setRows] = useState<UbkLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ label: string; sheetUrl: string }>({ label: "", sheetUrl: "" });

  const [showForm, setShowForm] = useState(false);
  const [newTingkatan, setNewTingkatan] = useState(TINGKATAN_OPTIONS[0]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    fetch("/api/admin/ubk")
      .then((r) => r.json())
      .then((b) => setRows(b.data?.rows ?? []))
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!newUrl.trim()) { toast.error("URL diperlukan"); return; }
    setIsAdding(true);
    try {
      await apiSend("/api/admin/ubk", "POST", {
        tingkatan: newTingkatan,
        label: newLabel || undefined,
        sheetUrl: newUrl,
      });
      toast.success("Link ditambah");
      setNewLabel(""); setNewUrl(""); setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah link");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/admin/ubk/${id}`, "DELETE");
      toast.success("Link dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam");
    }
  }

  function startEdit(row: UbkLink) {
    setEditingId(row.id);
    setEditValues({ label: row.label ?? "", sheetUrl: row.sheetUrl });
  }

  async function handleSaveEdit(id: number) {
    try {
      await apiSend(`/api/admin/ubk/${id}`, "PATCH", {
        label: editValues.label || undefined,
        sheetUrl: editValues.sheetUrl,
      });
      toast.success("Link dikemaskini");
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengemaskini");
    }
  }

  async function handleImport(id: number) {
    setImportingId(id);
    try {
      const res = await apiSend<ImportResult>(`/api/admin/ubk/${id}/import`, "POST");
      toast.success(res.message);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import gagal");
    } finally {
      setImportingId(null);
    }
  }

  const groups = grouped(rows);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-tour="ubk-intro" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard UBK</h1>
          <p className="text-sm text-muted-foreground">Urus pautan Google Sheets ITP dan import data psikometrik</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="ubk-dashboard" steps={ubkDashboardSteps} />
          <Button asChild variant="outline" size="sm" data-tour="ubk-records-link">
            <Link href="/admin/psikometrik">Lihat Semua Rekod</Link>
          </Button>
          <Button size="sm" data-tour="ubk-add-btn" onClick={() => setShowForm((v) => !v)}>
            <Plus className="size-4" />
            Tambah Link
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div data-tour="ubk-form" className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium">Tambah Pautan Google Sheets</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tingkatan *</Label>
              <Select value={newTingkatan} onValueChange={setNewTingkatan}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TINGKATAN_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Label (opsional)</Label>
              <Input
                className="h-8 text-sm"
                placeholder="cth: ITP Sesi 2025"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">URL Google Sheets *</Label>
              <Input
                className="h-8 text-sm"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={isAdding}>
              {isAdding ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </div>
      )}

      {/* Links per tingkatan */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuatkan...</p>
      ) : (
        <div data-tour="ubk-groups" className="space-y-4">
          {TINGKATAN_OPTIONS.map((tingkatan) => (
            <div key={tingkatan} className="rounded-lg border">
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2.5">
                <span className="text-sm font-semibold">{tingkatan}</span>
                <span className="text-xs text-muted-foreground">{groups[tingkatan].length} pautan</span>
              </div>

              {groups[tingkatan].length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground italic">Tiada pautan ditambah</p>
              ) : (
                <div className="divide-y">
                  {groups[tingkatan].map((row, rowIndex) => (
                    <div key={row.id} className="px-4 py-3 space-y-2">
                      {editingId === row.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Input
                              className="h-8 text-sm"
                              placeholder="Label (opsional)"
                              value={editValues.label}
                              onChange={(e) => setEditValues((v) => ({ ...v, label: e.target.value }))}
                            />
                            <Input
                              className="h-8 text-sm"
                              placeholder="URL Google Sheets"
                              value={editValues.sheetUrl}
                              onChange={(e) => setEditValues((v) => ({ ...v, sheetUrl: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveEdit(row.id)}>
                              <Save className="size-3.5" />
                              Simpan
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              <X className="size-3.5" />
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {row.label ?? <span className="text-muted-foreground italic">Tiada label</span>}
                            </p>
                            <a
                              href={row.sheetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-xs"
                            >
                              <ExternalLink className="size-3 shrink-0" />
                              {row.sheetUrl.slice(0, 60)}...
                            </a>
                            {row.lastImportedAt && (
                              <p
                                className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"
                                {...(rowIndex === 0 ? { "data-tour": "ubk-last-import" } : {})}
                              >
                                <Clock className="size-3" />
                                Import terakhir: {new Date(row.lastImportedAt).toLocaleString("ms-MY")}
                                {row.lastImportCount !== null && ` · ${row.lastImportCount} rekod`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 text-xs"
                              onClick={() => handleImport(row.id)}
                              disabled={importingId === row.id}
                              {...(rowIndex === 0 ? { "data-tour": "ubk-import-btn" } : {})}
                            >
                              {importingId === row.id ? (
                                <RefreshCw className="size-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="size-3.5" />
                              )}
                              {importingId === row.id ? "Mengimport..." : "Import Sekarang"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => startEdit(row)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <DeleteConfirmDialog
                              trigger={
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="size-3.5" />
                                </Button>
                              }
                              onConfirm={() => handleDelete(row.id)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
