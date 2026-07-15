"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Image from "next/image";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { PageTour } from "@/components/admin/tour/page-tour";
import { galleryAlbumItemsSteps } from "@/components/admin/tour/tour-steps";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { apiGet, apiSend } from "@/lib/fetcher";

type GalleryItem = { id: string; image: string; caption: string | null; order: number };
type Album = { id: string; name: string; items: GalleryItem[] };

export default function AlbumItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: albumId } = use(params);
  const [album, setAlbum] = useState<Album | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  function load() {
    apiGet<Album>(`/api/gallery/albums/${albumId}`)
      .then((data) => {
        setAlbum(data);
        setCaptionDrafts(Object.fromEntries(data.items.map((item) => [item.id, item.caption ?? ""])));
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Gagal memuat album"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [albumId]);

  async function handleReorder(items: GalleryItem[]) {
    setAlbum((prev) => (prev ? { ...prev, items } : prev));
    try {
      await apiSend(
        `/api/gallery/albums/${albumId}/items/reorder`,
        "POST",
        items.map((item, index) => ({ itemId: item.id, order: index })),
      );
    } catch {
      load();
    }
  }

  function move(index: number, direction: -1 | 1) {
    if (!album) return;
    const next = [...album.items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    handleReorder(next);
  }

  async function handleSaveCaption(itemId: string) {
    try {
      await apiSend(`/api/gallery/albums/${albumId}/items/${itemId}`, "PATCH", {
        caption: captionDrafts[itemId],
      });
      toast.success("Keterangan disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan keterangan");
    }
  }

  async function handleDeleteItem(itemId: string) {
    try {
      await apiSend(`/api/gallery/albums/${albumId}/items/${itemId}`, "DELETE");
      toast.success("Foto dihapus");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus foto");
    }
  }

  async function handleUploadComplete(urls: string[]) {
    try {
      await apiSend(`/api/gallery/albums/${albumId}/items`, "POST", urls.map((image) => ({ image })));
      toast.success("Foto ditambahkan");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambah foto");
    }
  }

  if (!album) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{album.name}</h1>
        <PageTour tourKey={`gallery-album-items-${albumId}`} steps={galleryAlbumItemsSteps} />
      </div>

      <div data-tour="gallery-upload">
        <UploadDropzone
          endpoint="mediaUploader"
          onClientUploadComplete={(res) => handleUploadComplete(res.map((f) => f.ufsUrl))}
          onUploadError={(err) => {
            toast.error(err.message);
          }}
        />
      </div>

      {album.items.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada foto di album ini.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-tour="gallery-items-grid">
        {album.items.map((item, index) => (
          <div
            key={item.id}
            className="space-y-2 rounded-md border p-2"
            {...(index === 0 ? { "data-tour": "gallery-item-reorder" } : {})}
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
              <Image src={item.image} alt={item.caption ?? ""} fill className="object-cover object-top" />
            </div>
            <Input
              placeholder="Keterangan..."
              value={captionDrafts[item.id] ?? ""}
              onChange={(e) => setCaptionDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
              onBlur={() => handleSaveCaption(item.id)}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  disabled={index === album.items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown />
                </Button>
              </div>
              <DeleteConfirmDialog
                trigger={
                  <Button type="button" variant="ghost" size="icon-xs">
                    <Trash2 />
                  </Button>
                }
                onConfirm={() => handleDeleteItem(item.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
