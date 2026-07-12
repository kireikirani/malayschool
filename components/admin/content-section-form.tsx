"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Plus, Trash2, ExternalLink, Image as ImageIcon, TableProperties } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing-client";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { ContentItem, ContentSection, SectionType } from "@/lib/content";

const SECTION_TYPES: SectionType[] = [
  "hero",
  "text_block",
  "stats",
  "poster",
  "file_list",
  "quick_links",
  "simple_table",
  "card_grid",
  "gallery",
  "jk_table",
];

function emptyItem(sortOrder: number): ContentItem {
  return { label: "", title: "", value: "", body: "", url: "", fileUrl: "", imageUrl: "", meta: null, sortOrder };
}

type SectionValues = {
  pageKey?: string;
  unitSlug?: string;
  sectionKey: string;
  type: SectionType;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  linkLabel: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  items: ContentItem[];
};

function normalizeInitialValue(section?: Partial<ContentSection> & { pageKey?: string; unitSlug?: string }): SectionValues {
  return {
    pageKey: section?.pageKey,
    unitSlug: section?.unitSlug,
    sectionKey: section?.sectionKey ?? "",
    type: section?.type ?? "text_block",
    title: section?.title ?? "",
    subtitle: section?.subtitle ?? "",
    body: section?.body ?? "",
    imageUrl: section?.imageUrl ?? "",
    linkLabel: section?.linkLabel ?? "",
    linkUrl: section?.linkUrl ?? "",
    isActive: section?.isActive ?? true,
    sortOrder: section?.sortOrder ?? 0,
    items: section?.items?.map((item, index) => ({ ...item, sortOrder: item.sortOrder ?? index })) ?? [],
  };
}

function Collapsible({ label, children, defaultOpen = false }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-dashed border-border/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        {label}
      </button>
      {open && <div className="space-y-4 border-t border-dashed border-border/60 p-3">{children}</div>}
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title?: string | null; subtitle?: string | null }) {
  if (!title && !subtitle) return null;

  return (
    <div className="mb-6">
      {title ? <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2> : null}
      {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function LiveSectionPreview({ section }: { section: ContentSection }) {
  const sortedItems = [...section.items].sort((a, b) => a.sortOrder - b.sortOrder);

  if (!section.isActive) {
    return (
      <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
        Preview disembunyikan kerana seksyen ditanda tidak aktif.
      </div>
    );
  }

  if (section.type === "hero") {
    return (
      <section className="overflow-hidden rounded-md border border-border/70 bg-card">
        <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-8">
          <div>
            <SectionHeading title={section.title || "Hero Title"} subtitle={section.subtitle || "Hero subtitle"} />
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body || "Teks hero akan muncul di sini."}</p>
            {(section.linkLabel || section.linkUrl) && (
              <div className="mt-5">
                <span className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  {section.linkLabel || "Button"}
                  <ExternalLink className="size-4" />
                </span>
              </div>
            )}
          </div>
          <div className="overflow-hidden rounded-md border border-border/70 bg-muted/30">
            {section.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={section.imageUrl} alt={section.title || "Preview"} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground/60">
                <ImageIcon className="size-8" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "text_block") {
    return (
      <section className="bg-card px-6 py-6 shadow-sm">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">{section.body || "Kandungan akan muncul di sini."}</pre>
      </section>
    );
  }

  if (section.type === "stats") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(sortedItems.length > 0 ? sortedItems : [emptyItem(0)]).map((item, index) => (
            <div key={`${item.sortOrder}-${index}`} className="flex flex-col items-center justify-center bg-card px-5 py-6 text-center shadow-sm">
              <p className="font-heading text-3xl font-semibold text-primary md:text-4xl">{item.value || "--"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label || item.title || "Label"}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "poster") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="overflow-hidden rounded-md border border-border/70 bg-card">
          {section.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={section.imageUrl} alt={section.title || "Poster"} className="aspect-[4/3] w-full object-contain bg-muted/20" />
          ) : (
            <div className="flex min-h-64 items-center justify-center text-center text-muted-foreground">
              <div>
                <ImageIcon className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm font-medium">Poster / carta preview</p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.type === "quick_links") {
    return (
      <section className="bg-card px-6 py-6 shadow-sm">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-3 sm:grid-cols-2">
          {(sortedItems.length > 0 ? sortedItems : [emptyItem(0)]).map((item, index) => (
            <div key={`${item.sortOrder}-${index}`} className="flex items-center justify-between bg-muted/30 px-4 py-3 text-sm">
              <span>{item.title || item.label || "Quick link"}</span>
              <ExternalLink className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "simple_table" || section.type === "jk_table") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="overflow-x-auto bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  {section.type === "jk_table" ? "Nama" : "Perkara"}
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  {section.type === "jk_table" ? "Jawatan" : "Keterangan"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(sortedItems.length > 0 ? sortedItems : [emptyItem(0)]).map((item, index) => (
                <tr key={`${item.sortOrder}-${index}`} className="border-b border-border/40 last:border-0">
                  <td className="px-5 py-3 font-medium">{item.title || item.label || "Item"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{item.value || item.body || "Keterangan"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (section.type === "card_grid" || section.type === "gallery") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(sortedItems.length > 0 ? sortedItems : [emptyItem(0)]).map((item, index) => (
            <div key={`${item.sortOrder}-${index}`} className="flex flex-col bg-card p-5 shadow-sm">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.title || item.label || "Preview"} className="mb-4 aspect-video w-full object-cover" />
              ) : null}
              {item.label ? <p className="text-xs font-semibold tracking-wide text-primary uppercase">{item.label}</p> : null}
              <h3 className="mt-1 font-heading text-lg font-semibold">{item.title || "Card title"}</h3>
              {item.value ? <p className="mt-1 text-sm font-medium text-primary">{item.value}</p> : null}
              <p className="mt-2 text-sm text-muted-foreground">{item.body || "Card description"}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "file_list") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="space-y-3 rounded-md border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">Portal / daftar fail preview</div>
          {(sortedItems.length > 0 ? sortedItems : [emptyItem(0)]).map((item, index) => (
            <div key={`${item.sortOrder}-${index}`} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2">
              <span>{item.title || item.label || "Nama fail"}</span>
              <span className="text-xs text-muted-foreground">{item.fileUrl || item.url || "Belum ada URL"}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
      Preview untuk jenis seksyen ini belum tersedia.
    </div>
  );
}

export function ContentSectionForm({
  mode,
  action,
  redirectTo,
  initialValue,
  pageOptions,
  unitOptions,
}: {
  mode: "public" | "unit";
  action: "create" | "edit";
  redirectTo: string;
  initialValue?: Partial<ContentSection> & { id?: number; pageKey?: string; unitSlug?: string };
  pageOptions?: string[];
  unitOptions?: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<SectionValues>(normalizeInitialValue(initialValue));
  const [isSaving, setIsSaving] = useState(false);

  function setField<K extends keyof SectionValues>(key: K, value: SectionValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<ContentItem>) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeItem(index: number) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })),
    }));
  }

  function addItem() {
    setValues((prev) => ({ ...prev, items: [...prev.items, emptyItem(prev.items.length)] }));
  }

  async function handleSubmit() {
    setIsSaving(true);
    try {
      const url =
        action === "create"
          ? mode === "public" ? "/api/admin/content" : "/api/admin/units"
          : mode === "public" ? `/api/admin/content/${initialValue?.id}` : `/api/admin/units/${initialValue?.id}`;

      const method = action === "create" ? "POST" : "PATCH";
      const payload = {
        ...(mode === "public" ? { pageKey: values.pageKey } : { unitSlug: values.unitSlug }),
        sectionKey: values.sectionKey,
        type: values.type,
        title: values.title,
        subtitle: values.subtitle,
        body: values.body,
        imageUrl: values.imageUrl,
        linkLabel: values.linkLabel,
        linkUrl: values.linkUrl,
        isActive: values.isActive,
        sortOrder: Number(values.sortOrder),
        items: values.items.map((item, index) => ({ ...item, sortOrder: Number(item.sortOrder ?? index) })),
      };

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error?.message ?? "Gagal menyimpan");
      toast.success(action === "create" ? "Seksyen ditambah" : "Seksyen dikemaskini");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  }

  const previewSection: ContentSection = {
    ...(mode === "public" ? { pageKey: values.pageKey } : { unitSlug: values.unitSlug }),
    sectionKey: values.sectionKey || "preview-section",
    type: values.type,
    title: values.title,
    subtitle: values.subtitle,
    body: values.body,
    imageUrl: values.imageUrl,
    linkLabel: values.linkLabel,
    linkUrl: values.linkUrl,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
    items: values.items,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maklumat Seksyen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mode === "public" ? (
              <div className="space-y-1.5">
                <Label>Halaman</Label>
                <Select value={values.pageKey} onValueChange={(v) => setField("pageKey", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih halaman" /></SelectTrigger>
                  <SelectContent>{(pageOptions ?? []).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Halaman awam di mana seksyen ini akan dipaparkan.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={values.unitSlug} onValueChange={(v) => setField("unitSlug", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih unit" /></SelectTrigger>
                  <SelectContent>{(unitOptions ?? []).map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Unit yang berkaitan dengan seksyen ini.</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Jenis Seksyen</Label>
              <Select value={values.type} onValueChange={(v) => setField("type", v as SectionType)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                <SelectContent>{SECTION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Tentukan bagaimana konten seksyen ini akan dipaparkan.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_120px]">
            <div className="space-y-1.5">
              <Label>Tajuk</Label>
              <Input value={values.title} onChange={(e) => setField("title", e.target.value)} placeholder="Tajuk seksyen" />
              <p className="text-xs text-muted-foreground">Judul seksyen yang dipaparkan kepada pengunjung laman web.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Urutan</Label>
              <Input type="number" value={values.sortOrder} onChange={(e) => setField("sortOrder", Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Nombor lebih kecil dipapar dahulu.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={values.isActive} onCheckedChange={(checked) => setField("isActive", Boolean(checked))} id="isActive" />
            <Label htmlFor="isActive">Aktif</Label>
            <span className="text-xs text-muted-foreground">- Nyahtanda untuk menyembunyikan seksyen ini dari laman web.</span>
          </div>

          <Collapsible label="Tetapan Lanjutan (Section Key, Subtitle, Body, Gambar, Pautan)">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Section Key</Label>
                <Input value={values.sectionKey} onChange={(e) => setField("sectionKey", e.target.value)} placeholder="contoh: kpi, jk-1" />
                <p className="text-xs text-muted-foreground">ID unik seksyen dalam kod. Hanya ubah jika benar-benar perlu.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Subtitle</Label>
                <Input value={values.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
                <p className="text-xs text-muted-foreground">Sub tajuk di bawah tajuk utama seksyen.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <RichTextEditor value={values.body} onChange={(v) => setField("body", v)} />
              <p className="text-xs text-muted-foreground">Teks utama atau huraian untuk seksyen ini. Menyokong format Markdown.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Gambar (Image URL)</Label>
                <Input value={values.imageUrl} onChange={(e) => setField("imageUrl", e.target.value)} placeholder="https://..." />
                <p className="text-xs text-muted-foreground">URL gambar atau gunakan butang muat naik di bawah.</p>
                <UploadButton
                  endpoint="mediaUploader"
                  onClientUploadComplete={(files) => { if (files[0]) setField("imageUrl", files[0].ufsUrl); }}
                  onUploadError={(error) => { toast.error(error.message); }}
                  appearance={{ button: "text-xs h-auto px-2 py-1", allowedContent: "hidden" }}
                />
                {values.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={values.imageUrl} alt="Preview" className="mt-1 h-24 w-auto rounded border border-border/70 object-cover" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Pautan</Label>
                <div className="grid gap-2">
                  <Input placeholder="Label pautan" value={values.linkLabel} onChange={(e) => setField("linkLabel", e.target.value)} />
                  <Input placeholder="URL pautan" value={values.linkUrl} onChange={(e) => setField("linkUrl", e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">Label dan URL untuk butang atau pautan di seksyen ini.</p>
              </div>
            </div>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Item Seksyen</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="size-4" />
            Tambah Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {values.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
              Belum ada item. Klik Tambah Item untuk mula.
            </div>
          ) : (
            values.items.map((item, index) => (
              <div key={`${index}-${item.sortOrder}`} className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Item #{index + 1}</h3>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(index)}>
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tajuk / Nama</Label>
                    <Input value={item.title ?? ""} onChange={(e) => updateItem(index, { title: e.target.value })} placeholder="Tajuk item" />
                    <p className="text-xs text-muted-foreground">Nama atau tajuk entri ini.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Value / Jawatan</Label>
                    <Input value={item.value ?? ""} onChange={(e) => updateItem(index, { value: e.target.value })} placeholder="Nilai atau jawatan" />
                    <p className="text-xs text-muted-foreground">Nilai, jawatan, atau maklumat utama untuk entri ini.</p>
                  </div>
                </div>

                <Collapsible label="Lanjutan (Label, Body, URL, Fail, Gambar, Urutan)">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Label</Label>
                      <Input value={item.label ?? ""} onChange={(e) => updateItem(index, { label: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sort Order</Label>
                      <Input type="number" value={item.sortOrder} onChange={(e) => updateItem(index, { sortOrder: Number(e.target.value) })} className="w-28" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Body</Label>
                    <Textarea rows={2} value={item.body ?? ""} onChange={(e) => updateItem(index, { body: e.target.value })} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">URL</Label>
                      <Input value={item.url ?? ""} onChange={(e) => updateItem(index, { url: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">File URL</Label>
                      <Input value={item.fileUrl ?? ""} onChange={(e) => updateItem(index, { fileUrl: e.target.value })} />
                      <UploadButton
                        endpoint="documentUploader"
                        onClientUploadComplete={(files) => { if (files[0]) updateItem(index, { fileUrl: files[0].ufsUrl }); }}
                        onUploadError={(error) => { toast.error(error.message); }}
                        appearance={{ button: "text-xs h-auto px-2 py-1", allowedContent: "hidden" }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Image URL</Label>
                      <Input value={item.imageUrl ?? ""} onChange={(e) => updateItem(index, { imageUrl: e.target.value })} />
                      <UploadButton
                        endpoint="mediaUploader"
                        onClientUploadComplete={(files) => { if (files[0]) updateItem(index, { imageUrl: files[0].ufsUrl }); }}
                        onUploadError={(error) => { toast.error(error.message); }}
                        appearance={{ button: "text-xs h-auto px-2 py-1", allowedContent: "hidden" }}
                      />
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="Preview" className="mt-1 h-16 w-auto rounded border border-border/70 object-cover" />
                      )}
                    </div>
                  </div>
                </Collapsible>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TableProperties className="size-4" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/70 bg-background p-4 md:p-6">
            <LiveSectionPreview section={previewSection} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(redirectTo)}>Batal</Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : action === "create" ? "Tambah Seksyen" : "Kemaskini Seksyen"}
        </Button>
      </div>
    </div>
  );
}
