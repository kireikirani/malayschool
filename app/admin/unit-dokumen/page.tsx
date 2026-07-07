"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { PageTour } from "@/components/admin/tour/page-tour";
import { unitDokumenSteps } from "@/components/admin/tour/tour-steps";
import { UploadButton } from "@/lib/uploadthing-client";
import { apiSend } from "@/lib/fetcher";
import { UNITS } from "@/lib/units";

type DocRow = {
  id: number;
  unitSlug: string;
  type: "carta-org" | "dokumen";
  label: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc";
  tahun?: string | null;
  isVisible: boolean;
  sortOrder: number;
};

async function fetchDocs(unitSlug: string): Promise<DocRow[]> {
  const res = await fetch(`/api/unit-dokumen?unitSlug=${unitSlug}&limit=200`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return body.data;
}

function detectFileType(url: string): "pdf" | "image" | "doc" {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg)([?#]|$)/.test(lower)) return "image";
  if (/\.(doc|docx|xls|xlsx|ppt|pptx)([?#]|$)/.test(lower)) return "doc";
  return "pdf";
}

function UnitDokumenTab({ unit }: { unit: (typeof UNITS)[0] }) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  // URL mode state: keyed by slot label (or "custom-{n}" for custom docs)
  const [urlModes, setUrlModes] = useState<Record<string, boolean>>({});
  const [urlInputs, setUrlInputs] = useState<Record<string, { url: string; fileType: "pdf" | "image" | "doc" }>>({});
  const [savingUrl, setSavingUrl] = useState<string | null>(null);

  // Custom document form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customFileType, setCustomFileType] = useState<"pdf" | "image" | "doc">("pdf");
  const [customTahun, setCustomTahun] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);

  const load = useCallback(() => {
    fetchDocs(unit.slug)
      .then(setDocs)
      .catch((err) => toast.error(err.message));
  }, [unit.slug]);

  useEffect(() => {
    load();
  }, [load]);

  const cartaOrg = docs.find((d) => d.type === "carta-org");
  const customDocs = docs.filter(
    (d) =>
      d.type === "dokumen" &&
      !unit.dokumen?.some((slot) => slot.label === d.label),
  );

  async function handleDelete(id: number) {
    try {
      await apiSend(`/api/unit-dokumen/${id}`, "DELETE");
      toast.success("Fail dipadam");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memadam");
    }
  }

  async function handleToggleVisibility(id: number, current: boolean) {
    setToggling(id);
    try {
      await apiSend(`/api/unit-dokumen/${id}`, "PATCH", { isVisible: !current });
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isVisible: !current } : d)),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengemas kini");
    } finally {
      setToggling(null);
    }
  }

  async function handleUploadDoc(
    fileUrl: string,
    label: string,
    type: "carta-org" | "dokumen",
    fileType: "pdf" | "image",
    sortOrder = 0,
  ) {
    try {
      const existing = docs.find((d) => d.type === type && d.label === label);
      if (existing) await apiSend(`/api/unit-dokumen/${existing.id}`, "DELETE");

      await apiSend("/api/unit-dokumen", "POST", {
        unitSlug: unit.slug,
        type,
        label,
        fileUrl,
        fileType,
        sortOrder,
      });
      toast.success("Fail berjaya dimuat naik");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  async function handleSaveUrl(label: string, type: "carta-org" | "dokumen", sortOrder = 0) {
    const input = urlInputs[label];
    if (!input?.url.trim()) {
      toast.error("Sila masukkan URL");
      return;
    }
    setSavingUrl(label);
    try {
      const autoFileType = input.fileType || detectFileType(input.url);
      const existing = docs.find((d) => d.type === type && d.label === label);
      if (existing) {
        await apiSend(`/api/unit-dokumen/${existing.id}`, "PATCH", {
          fileUrl: input.url.trim(),
          fileType: autoFileType,
        });
      } else {
        await apiSend("/api/unit-dokumen", "POST", {
          unitSlug: unit.slug,
          type,
          label,
          fileUrl: input.url.trim(),
          fileType: autoFileType,
          sortOrder,
        });
      }
      toast.success("URL berjaya disimpan");
      setUrlModes((prev) => ({ ...prev, [label]: false }));
      setUrlInputs((prev) => ({ ...prev, [label]: { url: "", fileType: "pdf" } }));
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan URL");
    } finally {
      setSavingUrl(null);
    }
  }

  async function handleSaveCustom() {
    if (!customLabel.trim()) { toast.error("Sila masukkan tajuk dokumen"); return; }
    if (!customUrl.trim()) { toast.error("Sila masukkan URL atau muat naik fail"); return; }
    setSavingCustom(true);
    try {
      await apiSend("/api/unit-dokumen", "POST", {
        unitSlug: unit.slug,
        type: "dokumen",
        label: customLabel.trim(),
        fileUrl: customUrl.trim(),
        fileType: customFileType,
        tahun: customTahun.trim() || undefined,
        sortOrder: 99,
      });
      toast.success("Dokumen ditambah");
      setCustomLabel("");
      setCustomUrl("");
      setCustomTahun("");
      setCustomFileType("pdf");
      setShowCustomForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah dokumen");
    } finally {
      setSavingCustom(false);
    }
  }

  function toggleUrlMode(label: string) {
    setUrlModes((prev) => ({ ...prev, [label]: !prev[label] }));
    if (!urlInputs[label]) {
      setUrlInputs((prev) => ({ ...prev, [label]: { url: "", fileType: "pdf" } }));
    }
  }

  return (
    <div className="space-y-8">
      {/* ─── Carta Organisasi ─── */}
      <section data-tour="carta-org">
        <h3 className="mb-4 text-sm font-semibold">Carta Organisasi</h3>
        {cartaOrg ? (
          <div className="flex items-start gap-4 border border-border/70 bg-card p-4">
            <div className="relative aspect-video w-48 overflow-hidden border bg-muted">
              <Image
                src={cartaOrg.fileUrl}
                alt="Carta Organisasi"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-medium">Carta Organisasi {unit.title}</p>
              <p className="text-xs text-muted-foreground max-w-xs truncate">{cartaOrg.fileUrl}</p>

              <div className="flex items-center gap-2">
                <Switch
                  checked={cartaOrg.isVisible}
                  disabled={toggling === cartaOrg.id}
                  onCheckedChange={() => handleToggleVisibility(cartaOrg.id, cartaOrg.isVisible)}
                />
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {cartaOrg.isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                  {cartaOrg.isVisible ? "Dipaparkan" : "Disembunyikan"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <UploadButton
                  endpoint="mediaUploader"
                  onClientUploadComplete={(res) => {
                    if (res[0])
                      handleUploadDoc(
                        res[0].ufsUrl,
                        `Carta Organisasi ${unit.title}`,
                        "carta-org",
                        "image",
                      );
                  }}
                  onUploadError={(err) => toast.error(err.message)}
                  appearance={{ button: "text-xs px-3 py-1.5 h-auto", allowedContent: "hidden" }}
                />
                <DeleteConfirmDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      <Trash2 className="size-3.5" />
                      Padam
                    </Button>
                  }
                  onConfirm={() => handleDelete(cartaOrg.id)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 border border-dashed border-border bg-muted/30 py-8 text-center">
            <ImageIcon className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada carta organisasi</p>
            <UploadButton
              endpoint="mediaUploader"
              onUploadBegin={() => setUploading("carta-org")}
              onClientUploadComplete={(res) => {
                setUploading(null);
                if (res[0])
                  handleUploadDoc(
                    res[0].ufsUrl,
                    `Carta Organisasi ${unit.title}`,
                    "carta-org",
                    "image",
                  );
              }}
              onUploadError={(err) => { setUploading(null); toast.error(err.message); }}
              appearance={{ button: "text-xs", allowedContent: "hidden" }}
            />
            {uploading === "carta-org" && (
              <p className="text-xs text-muted-foreground">Memuat naik...</p>
            )}
          </div>
        )}
      </section>

      {/* ─── Predefined Dokumen Slots ─── */}
      {unit.dokumen && unit.dokumen.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold">Dokumen PDF</h3>
          <div className="space-y-3">
            {unit.dokumen.map((dokItem, idx) => {
              const uploaded = docs.find(
                (d) => d.type === "dokumen" && d.label === dokItem.label,
              );
              const isUrlMode = urlModes[dokItem.label] ?? false;
              const urlInput = urlInputs[dokItem.label] ?? { url: "", fileType: "pdf" as const };

              return (
                <div
                  key={dokItem.label}
                  className="border border-border/70 bg-card px-4 py-4 space-y-3"
                  {...(idx === 0 ? { "data-tour": "dokumen-slot" } : {})}
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center bg-primary/8 text-primary">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{dokItem.label}</p>
                      {dokItem.desc && (
                        <p className="text-xs text-muted-foreground">{dokItem.desc}</p>
                      )}
                      {uploaded && (
                        <a
                          href={uploaded.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <FileText className="size-3" />
                          Lihat fail
                        </a>
                      )}
                    </div>

                    {/* Visibility toggle (only when uploaded) */}
                    {uploaded && (
                      <div className="flex shrink-0 items-center gap-1.5" {...(idx === 0 ? { "data-tour": "visibility-switch" } : {})}>
                        <Switch
                          checked={uploaded.isVisible}
                          disabled={toggling === uploaded.id}
                          onCheckedChange={() =>
                            handleToggleVisibility(uploaded.id, uploaded.isVisible)
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {uploaded.isVisible ? (
                            <Eye className="size-3" />
                          ) : (
                            <EyeOff className="size-3" />
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload / URL mode */}
                  {isUrlMode ? (
                    <div className="flex flex-col gap-2 pl-11">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://drive.google.com/... atau URL lain"
                          value={urlInput.url}
                          onChange={(e) =>
                            setUrlInputs((prev) => ({
                              ...prev,
                              [dokItem.label]: { ...urlInput, url: e.target.value },
                            }))
                          }
                          className="h-8 text-xs flex-1"
                        />
                        <Select
                          value={urlInput.fileType}
                          onValueChange={(v) =>
                            setUrlInputs((prev) => ({
                              ...prev,
                              [dokItem.label]: { ...urlInput, fileType: v as "pdf" | "image" | "doc" },
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="image">Imej</SelectItem>
                            <SelectItem value="doc">DOC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveUrl(dokItem.label, "dokumen", idx)}
                          disabled={savingUrl === dokItem.label}
                          className="h-7 text-xs"
                        >
                          {savingUrl === dokItem.label ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : null}
                          Simpan URL
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUrlMode(dokItem.label)}
                          className="h-7 text-xs"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 pl-11">
                      {uploaded ? (
                        <>
                          <UploadButton
                            endpoint="documentUploader"
                            onClientUploadComplete={(res) => {
                              if (res[0])
                                handleUploadDoc(res[0].ufsUrl, dokItem.label, "dokumen", "pdf", idx);
                            }}
                            onUploadError={(err) => toast.error(err.message)}
                            appearance={{
                              button: "text-xs px-2 py-1 h-auto",
                              allowedContent: "hidden",
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => toggleUrlMode(dokItem.label)}
                          >
                            <Link2 className="size-3" />
                            Tukar ke URL
                          </Button>
                          <DeleteConfirmDialog
                            trigger={
                              <Button variant="ghost" size="icon-sm">
                                <Trash2 className="size-3.5 text-muted-foreground" />
                              </Button>
                            }
                            onConfirm={() => handleDelete(uploaded.id)}
                          />
                        </>
                      ) : (
                        <>
                          <UploadButton
                            endpoint="documentUploader"
                            onUploadBegin={() => setUploading(`dok-${idx}`)}
                            onClientUploadComplete={(res) => {
                              setUploading(null);
                              if (res[0])
                                handleUploadDoc(res[0].ufsUrl, dokItem.label, "dokumen", "pdf", idx);
                            }}
                            onUploadError={(err) => {
                              setUploading(null);
                              toast.error(err.message);
                            }}
                            appearance={{
                              button: "text-xs px-2 py-1 h-auto",
                              allowedContent: "hidden",
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => toggleUrlMode(dokItem.label)}
                            {...(idx === 0 ? { "data-tour": "url-toggle" } : {})}
                          >
                            <Link2 className="size-3" />
                            Link URL / GDrive
                          </Button>
                          {uploading === `dok-${idx}` && (
                            <span className="text-xs text-muted-foreground">Memuat naik...</span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Custom / Extra Documents ─── */}
      {customDocs.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold">Dokumen Tambahan</h3>
          <div className="space-y-3">
            {customDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 border border-border/70 bg-card px-4 py-3"
              >
                <FileText className="size-4 shrink-0 text-primary/70" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{doc.label}</p>
                  {doc.tahun && (
                    <p className="text-xs text-muted-foreground">{doc.tahun}</p>
                  )}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Lihat
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={doc.isVisible}
                    disabled={toggling === doc.id}
                    onCheckedChange={() => handleToggleVisibility(doc.id, doc.isVisible)}
                  />
                  <DeleteConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm">
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    }
                    onConfirm={() => handleDelete(doc.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Add Custom Document ─── */}
      <section>
        {showCustomForm ? (
          <div className="border border-border/70 bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Tambah Dokumen Baharu</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Tajuk Dokumen</Label>
                <Input
                  placeholder="Contoh: Laporan Tahunan 2025"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tahun (pilihan)</Label>
                <Input
                  placeholder="2025"
                  value={customTahun}
                  onChange={(e) => setCustomTahun(e.target.value)}
                  className="h-8 text-xs"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <Label className="text-xs">URL / Google Drive Link</Label>
                <Input
                  placeholder="https://drive.google.com/file/d/..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Jenis Fail</Label>
                <Select
                  value={customFileType}
                  onValueChange={(v) => setCustomFileType(v as "pdf" | "image" | "doc")}
                >
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Imej</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveCustom} disabled={savingCustom} className="h-7 text-xs">
                {savingCustom ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                Tambah
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomLabel("");
                  setCustomUrl("");
                }}
                className="h-7 text-xs"
              >
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomForm(true)}
            className="gap-1.5"
            data-tour="add-custom"
          >
            <Plus className="size-4" />
            Tambah Dokumen Lain
          </Button>
        )}
      </section>
    </div>
  );
}

export default function UnitDokumenPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dokumen Unit</h1>
          <p className="text-sm text-muted-foreground">
            Carta organisasi dan dokumen PDF bagi setiap unit pengurusan
          </p>
        </div>
        <PageTour tourKey="unit-dokumen" steps={unitDokumenSteps} />
      </div>

      <Tabs defaultValue={UNITS[0].slug}>
        <TabsList className="h-auto flex-wrap gap-1" data-tour="unit-tabs">
          {UNITS.map((unit) => (
            <TabsTrigger key={unit.slug} value={unit.slug} className="text-xs">
              {unit.navLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {UNITS.map((unit) => (
          <TabsContent key={unit.slug} value={unit.slug} className="mt-6">
            <UnitDokumenTab unit={unit} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
