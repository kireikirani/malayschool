"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { mediaSteps } from "@/components/admin/tour/tour-steps";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { PaginationControls } from "@/components/public/pagination-controls";
import { DocumentPreview } from "@/components/public/document-preview";
import { UploadButton } from "@/lib/uploadthing-client";
import { apiSend } from "@/lib/fetcher";
import { formatFileSize, getFileTypeInfo, isDocumentLink, isImageMimeType } from "@/lib/file-type";

type MediaItem = {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  fileType: string | null;
  fileSize: number | null;
};

async function fetchMedia(params: URLSearchParams): Promise<{ rows: MediaItem[]; totalPages: number }> {
  params.set("folder", "general");
  const res = await fetch(`/api/media?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat data");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function MediaLibraryPage() {
  const [rows, setRows] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (search) params.set("q", search);
    fetchMedia(params)
      .then(({ rows, totalPages }) => {
        setRows(rows);
        setTotalPages(totalPages);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/media/${id}`, "DELETE");
      toast.success("Media dihapus");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus media");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media</h1>
          <p className="text-sm text-muted-foreground">Perpustakaan aset umum seperti gambar untuk galeri, berita, dan banner.</p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="media" steps={mediaSteps} />
          <div data-tour="media-upload">
            <UploadButton
              endpoint="mediaUploader"
              onClientUploadComplete={() => {
                setIsLoading(true);
                toast.success("Gambar berhasil diunggah");
                load();
              }}
              onUploadError={(err) => {
                toast.error(err.message);
              }}
            />
          </div>
        </div>
      </div>

      <Input
        data-tour="media-search"
        placeholder="Cari nama file..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsLoading(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsLoading(true);
            load();
          }
        }}
        className="max-w-xs"
      />

      <div data-tour="media-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        {!isLoading && rows.length === 0 && (
          <EmptyState
            icon={ImageIcon}
            title="Belum ada media"
            description="Upload gambar melalui UploadThing untuk digunakan di galeri, berita, banner, atau konten lainnya."
            className="col-span-full"
          />
        )}
        {!isLoading &&
          rows.map((item) => (
            <div key={item.id} className="group space-y-3 border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(35,24,16,0.45)]">
              {isImageMimeType(item.fileType) ? (
                <div className="relative aspect-[4/3] overflow-hidden border border-border/70 bg-muted">
                  <Image src={item.filePath} alt={item.fileName} fill className="object-cover" />
                </div>
              ) : isDocumentLink(item.fileName || item.filePath) ? (
                <DocumentPreview url={item.filePath} />
              ) : (
                <div className="flex min-h-48 items-center justify-center border border-dashed border-border bg-muted/40 px-4 text-center text-sm text-muted-foreground">
                  Pratinjau belum tersedia untuk fail ini.
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className={`flex size-11 shrink-0 items-center justify-center border border-border/60 ${getFileTypeInfo(item.fileName).colorClass}`}>
                  <span dangerouslySetInnerHTML={{ __html: getFileTypeInfo(item.fileName).iconSvg }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {getFileTypeInfo(item.fileName).label}
                    {typeof item.fileSize === "number" ? ` · ${formatFileSize(item.fileSize)}` : ""}
                  </p>
                </div>
                <DeleteConfirmDialog
                  trigger={
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 />
                    </Button>
                  }
                  onConfirm={() => handleDelete(item.id)}
                />
              </div>
            </div>
          ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setIsLoading(true);
          setPage(nextPage);
        }}
      />
    </div>
  );
}
