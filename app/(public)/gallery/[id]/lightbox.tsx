"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type GalleryItem = { id: string; image: string; caption: string | null };

export function GalleryLightbox({ items, albumName }: { items: GalleryItem[]; albumName: string }) {
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="relative aspect-[4/3] overflow-hidden border border-border/70 bg-muted shadow-[0_18px_40px_-34px_rgba(35,24,16,0.5)]"
            onClick={() => setActiveImage(item)}
          >
            <Image src={item.image} alt={item.caption ?? albumName} fill className="object-cover" />
          </button>
        ))}
      </div>

      <Dialog open={!!activeImage} onOpenChange={(open) => { if (!open) setActiveImage(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">{activeImage?.caption ?? albumName}</DialogTitle>
          {activeImage && (
            <div className="relative h-[70vh] w-full overflow-hidden border border-border/70 bg-muted">
              <Image src={activeImage.image} alt={activeImage.caption ?? albumName} fill className="object-contain" />
            </div>
          )}
          {activeImage?.caption && <p className="text-sm text-muted-foreground">{activeImage.caption}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
