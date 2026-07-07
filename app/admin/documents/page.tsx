"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Trash2 } from "lucide-react";
import { PageTour } from "@/components/admin/tour/page-tour";
import { documentsSteps } from "@/components/admin/tour/tour-steps";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/public/pagination-controls";
import { DocumentPreview } from "@/components/public/document-preview";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { UploadButton } from "@/lib/uploadthing-client";
import { apiSend } from "@/lib/fetcher";
import { formatFileSize, getFileTypeInfo } from "@/lib/file-type";

type DocumentItem = {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  fileType: string | null;
  fileSize: number | null;
};

type DocumentCategory = "all" | "spreadsheet" | "pdf" | "document";

const CATEGORY_TABS: Array<{ value: DocumentCategory; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Dokumen" },
];

async function fetchDocuments(params: URLSearchParams): Promise<{ rows: DocumentItem[]; totalPages: number }> {
  params.set("folder", "documents");
  const res = await fetch(`/api/media?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat dokumen");
  return { rows: body.data, totalPages: body.pagination.totalPages };
}

export default function SchoolDocumentsAdminPage() {
  const [rows, setRows] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("all");

  function load() {
    const params = new URLSearchParams({ page: String(page), limit: "18" });
    if (search) params.set("q", search);
    if (category !== "all") params.set("category", category);

    fetchDocuments(params)
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
  }, [page, category]);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      await apiSend(`/api/media/${id}`, "DELETE");
      toast.success("Dokumen dihapus");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus dokumen");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dokumen Sekolah</h1>
          <p className="text-sm text-muted-foreground">
            Upload file sekolah melalui UploadThing. Metadata sahaja disimpan di database utama.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PageTour tourKey="documents" steps={documentsSteps} />
          <div data-tour="docs-upload">
            <UploadButton
              endpoint="documentUploader"
              onClientUploadComplete={() => {
                setIsLoading(true);
                toast.success("Dokumen berhasil diunggah");
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
        placeholder="Cari nama dokumen..."
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

      <div data-tour="docs-category" className="flex flex-wrap gap-2">
        {CATEGORY_TABS.map((tab) => {
          const isActive = category === tab.value;

          return (
            <Button
              key={tab.value}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="min-w-24"
              onClick={() => {
                setIsLoading(true);
                setCategory(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      <div data-tour="docs-grid" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
        {!isLoading && rows.length === 0 && (
          <EmptyState
            icon={FileSpreadsheet}
            title={category === "all" ? "Belum ada dokumen sekolah" : "Tidak ada dokumen dalam kategori ini"}
            description={
              category === "all"
                ? "Upload fail seperti PDF, XLSX, XLS, atau CSV untuk memaparkan data rasmi sekolah di halaman publik."
                : "Cuba pilih tab lain atau ubah kata kunci pencarian untuk melihat dokumen yang tersedia."
            }
            className="col-span-full"
          />
        )}
        {!isLoading &&
          rows.map((item) => {
            const info = getFileTypeInfo(item.fileName);

            return (
              <div key={item.id} className="group space-y-3 border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(35,24,16,0.45)]">
                <DocumentPreview url={item.filePath} />
                <div className="flex items-start gap-3">
                  <span className={`flex size-11 shrink-0 items-center justify-center border border-border/60 ${info.colorClass}`}>
                    <span dangerouslySetInnerHTML={{ __html: info.iconSvg }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {info.label}
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
            );
          })}
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
