"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { PaginationControls } from "@/components/public/pagination-controls";
import { UploadButton } from "@/lib/uploadthing-client";
import { apiSend } from "@/lib/fetcher";

type MediaItem = {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
};

async function fetchMedia(params: URLSearchParams): Promise<{ rows: MediaItem[]; totalPages: number }> {
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
    setIsLoading(true);
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
    try {
      await apiSend(`/api/media/${id}`, "DELETE");
      toast.success("Media dihapus");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus media");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Media</h1>
        <UploadButton
          endpoint="mediaUploader"
          onClientUploadComplete={() => {
            toast.success("Berhasil mengunggah");
            load();
          }}
          onUploadError={(err) => {
            toast.error(err.message);
          }}
        />
      </div>

      <Input
        placeholder="Cari nama file..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && load()}
        className="max-w-xs"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {isLoading &&
          Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
        {!isLoading && rows.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">Belum ada media.</p>
        )}
        {!isLoading &&
          rows.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
              <Image src={item.filePath} alt={item.fileName} fill className="object-cover" />
              <DeleteConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-xs"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 />
                  </Button>
                }
                onConfirm={() => handleDelete(item.id)}
              />
            </div>
          ))}
      </div>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
