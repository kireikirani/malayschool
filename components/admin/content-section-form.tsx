"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadthing-client";
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
  return {
    label: "",
    title: "",
    value: "",
    body: "",
    url: "",
    fileUrl: "",
    imageUrl: "",
    meta: null,
    sortOrder,
  };
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
      items: prev.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeItem(index: number) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, sortOrder: itemIndex })),
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
          ? mode === "public"
            ? "/api/admin/content"
            : "/api/admin/units"
          : mode === "public"
            ? `/api/admin/content/${initialValue?.id}`
            : `/api/admin/units/${initialValue?.id}`;

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
        items: values.items.map((item, index) => ({
          ...item,
          sortOrder: Number(item.sortOrder ?? index),
        })),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
                <Select value={values.pageKey} onValueChange={(value) => setField("pageKey", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih halaman" />
                  </SelectTrigger>
                  <SelectContent>
                    {(pageOptions ?? []).map((page) => (
                      <SelectItem key={page} value={page}>
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select value={values.unitSlug} onValueChange={(value) => setField("unitSlug", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unitOptions ?? []).map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Jenis Seksyen</Label>
              <Select value={values.type} onValueChange={(value) => setField("type", value as SectionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Section Key</Label>
              <Input value={values.sectionKey} onChange={(event) => setField("sectionKey", event.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={values.sortOrder} onChange={(event) => setField("sortOrder", Number(event.target.value))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tajuk</Label>
            <Input value={values.title} onChange={(event) => setField("title", event.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Subtitle</Label>
            <Textarea rows={3} value={values.subtitle} onChange={(event) => setField("subtitle", event.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Body</Label>
            <Textarea rows={5} value={values.body} onChange={(event) => setField("body", event.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input value={values.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} />
              <UploadButton
                endpoint="mediaUploader"
                onClientUploadComplete={(files) => {
                  if (files[0]) setField("imageUrl", files[0].ufsUrl);
                }}
                onUploadError={(error) => { toast.error(error.message); }}
                appearance={{ button: "text-xs h-auto px-2 py-1", allowedContent: "hidden" }}
              />
              {values.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.imageUrl} alt="Preview" className="mt-1 h-24 w-auto rounded border border-border/70 object-cover" />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Link</Label>
              <div className="grid gap-3">
                <Input placeholder="Label pautan" value={values.linkLabel} onChange={(event) => setField("linkLabel", event.target.value)} />
                <Input placeholder="URL pautan" value={values.linkUrl} onChange={(event) => setField("linkUrl", event.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={values.isActive} onCheckedChange={(checked) => setField("isActive", Boolean(checked))} />
            <Label>Aktif</Label>
          </div>
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
        <CardContent className="space-y-4">
          {values.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
              Belum ada item.
            </div>
          ) : (
            values.items.map((item, index) => (
              <div key={`${index}-${item.sortOrder}`} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Item #{index + 1}</h3>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(index)}>
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Label</Label>
                    <Input value={item.label ?? ""} onChange={(event) => updateItem(index, { label: event.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tajuk</Label>
                    <Input value={item.title ?? ""} onChange={(event) => updateItem(index, { title: event.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Value</Label>
                    <Input value={item.value ?? ""} onChange={(event) => updateItem(index, { value: event.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sort Order</Label>
                    <Input type="number" value={item.sortOrder} onChange={(event) => updateItem(index, { sortOrder: Number(event.target.value) })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Body</Label>
                  <Textarea rows={3} value={item.body ?? ""} onChange={(event) => updateItem(index, { body: event.target.value })} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>URL</Label>
                    <Input value={item.url ?? ""} onChange={(event) => updateItem(index, { url: event.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>File URL</Label>
                    <Input value={item.fileUrl ?? ""} onChange={(event) => updateItem(index, { fileUrl: event.target.value })} />
                    <UploadButton
                      endpoint="documentUploader"
                      onClientUploadComplete={(files) => {
                        if (files[0]) updateItem(index, { fileUrl: files[0].ufsUrl });
                      }}
                      onUploadError={(error) => { toast.error(error.message); }}
                      appearance={{ button: "text-xs h-auto px-2 py-1", allowedContent: "hidden" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Image URL</Label>
                    <Input value={item.imageUrl ?? ""} onChange={(event) => updateItem(index, { imageUrl: event.target.value })} />
                    <UploadButton
                      endpoint="mediaUploader"
                      onClientUploadComplete={(files) => {
                        if (files[0]) updateItem(index, { imageUrl: files[0].ufsUrl });
                      }}
                      onUploadError={(error) => { toast.error(error.message); }}
                      appearance={{ button: "text-xs h-auto px-2 py-1", allowedContent: "hidden" }}
                    />
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="Preview" className="mt-1 h-24 w-auto rounded border border-border/70 object-cover" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push(redirectTo)}>
          Batal
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : action === "create" ? "Tambah Seksyen" : "Kemaskini Seksyen"}
        </Button>
      </div>
    </div>
  );
}

