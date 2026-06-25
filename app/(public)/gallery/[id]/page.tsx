"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

type GalleryItem = { id: string; image: string; caption: string | null };
type Album = { id: string; name: string; description: string | null; items: GalleryItem[] };

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [album, setAlbum] = useState<Album | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetch(`/api/gallery/albums/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFoundFlag(true);
          return null;
        }
        return res.json();
      })
      .then((body) => {
        if (body) setAlbum(body.data);
      });
  }, [id]);

  if (notFoundFlag) notFound();

  if (!album) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">{album.name}</h1>
        {album.description && <p className="text-muted-foreground">{album.description}</p>}
      </div>

      {album.items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada foto di album ini.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {album.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="relative aspect-square overflow-hidden rounded-md bg-muted"
            onClick={() => setActiveImage(item)}
          >
            <Image src={item.image} alt={item.caption ?? album.name} fill className="object-cover" />
          </button>
        ))}
      </div>

      <Dialog open={!!activeImage} onOpenChange={(open) => !open && setActiveImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">{activeImage?.caption ?? album.name}</DialogTitle>
          {activeImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              <Image src={activeImage.image} alt={activeImage.caption ?? album.name} fill className="object-contain" />
            </div>
          )}
          {activeImage?.caption && <p className="text-sm text-muted-foreground">{activeImage.caption}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
