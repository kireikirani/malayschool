"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DocItem = {
  id: number;
  label: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc";
  tahun?: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
};

function isGoogleDriveUrl(url: string) {
  return url.includes("drive.google.com");
}

function getGoogleDrivePreviewUrl(url: string) {
  const fileMatch = url.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  const idMatch = url.match(/[?&]id=([^&#]+)/);
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  return url;
}

function resolvePreview(fileUrl: string, fileType: "pdf" | "image" | "doc"): { kind: "iframe" | "image"; url: string } {
  if (isGoogleDriveUrl(fileUrl)) {
    return { kind: "iframe", url: getGoogleDrivePreviewUrl(fileUrl) };
  }
  if (fileType === "doc") {
    return { kind: "iframe", url: `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` };
  }
  if (fileType === "image") {
    return { kind: "image", url: fileUrl };
  }
  return { kind: "iframe", url: fileUrl };
}

const FILE_ICON: Record<DocItem["fileType"], React.ReactNode> = {
  pdf: <FileText className="size-4 shrink-0 text-red-500/75" />,
  image: <ImageIcon className="size-4 shrink-0 text-blue-500/75" />,
  doc: <FileSpreadsheet className="size-4 shrink-0 text-emerald-600/75" />,
};

const FILE_BADGE: Record<DocItem["fileType"], string> = {
  pdf: "PDF",
  image: "Imej",
  doc: "DOC",
};

export function DocumentPortal({
  unitSlug,
  title,
  subtitle,
}: {
  unitSlug: string;
  title?: string | null;
  subtitle?: string | null;
}) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DocItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/unit-dokumen?unitSlug=${encodeURIComponent(unitSlug)}&type=dokumen&limit=200`,
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat dokumen");
      const visible = (body.data as DocItem[]).filter((d) => d.isVisible !== false);
      setDocs(visible);
      if (visible.length > 0) setSelected(visible[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ralat tidak diketahui");
    } finally {
      setLoading(false);
    }
  }, [unitSlug]);

  useEffect(() => { load(); }, [load]);

  const filtered = docs.filter((d) =>
    d.label.toLowerCase().includes(search.toLowerCase()),
  );

  const preview = selected ? resolvePreview(selected.fileUrl, selected.fileType) : null;

  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      <div className="overflow-hidden border border-border/70 bg-card">
        {/* Toolbar */}
        <div className="border-b border-border/60 px-4 py-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Cari dokumen..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Memuat dokumen...
          </div>
        ) : error ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="size-5 text-destructive/70" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-8 text-muted-foreground/30" />
            <p>{search ? "Tiada dokumen dijumpai" : "Belum ada dokumen tersedia"}</p>
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-primary underline-offset-2 hover:underline">
                Padam carian
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-[500px] divide-x divide-border/50 max-md:flex-col max-md:h-auto">
            {/* Left — document list */}
            <div className="w-64 shrink-0 overflow-y-auto max-md:w-full max-md:border-b max-md:border-border/50 max-md:h-48">
              {filtered.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelected(doc)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/40",
                    selected?.id === doc.id &&
                      "border-l-2 border-l-primary bg-primary/8",
                  )}
                >
                  {FILE_ICON[doc.fileType]}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">
                      {doc.label}
                    </p>
                    {doc.tahun && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {doc.tahun}
                      </p>
                    )}
                    <span className="mt-1 inline-block rounded-sm bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {FILE_BADGE[doc.fileType]}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right — preview pane */}
            <div className="flex flex-1 flex-col overflow-hidden max-md:h-72">
              {selected && preview ? (
                <>
                  <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      {FILE_ICON[selected.fileType]}
                      <span className="truncate text-sm font-medium">{selected.label}</span>
                    </div>
                    <a
                      href={selected.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                      Buka
                    </a>
                  </div>

                  <div className="flex-1 overflow-hidden bg-muted/20">
                    {preview.kind === "image" ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={preview.url}
                          alt={selected.label}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    ) : (
                      <iframe
                        key={preview.url}
                        src={preview.url}
                        className="h-full w-full border-0"
                        title={selected.label}
                        allow="autoplay"
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Pilih dokumen untuk pratonton
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
