"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type GalleryItem = { id: string; image: string; caption: string | null };

export function GalleryLightbox({
  items,
  albumName,
  tarikh,
  linkGdrive,
}: {
  items: GalleryItem[];
  albumName: string;
  tarikh?: string | null;
  linkGdrive?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  }, [items.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, prev, next]);

  return (
    <>
      {(tarikh || linkGdrive) && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {tarikh && <span>{tarikh}</span>}
          {linkGdrive && (
            <a
              href={linkGdrive}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline hover:text-foreground"
            >
              Lihat di Google Drive
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Pinterest/masonry grid */}
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="mb-3 block w-full break-inside-avoid overflow-hidden border border-border/70 bg-muted shadow-[0_18px_40px_-34px_rgba(35,24,16,0.5)] transition-transform hover:scale-[1.01]"
            onClick={() => setActiveIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.caption ?? albumName}
              className="block h-auto w-full"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={(open) => { if (!open) setActiveIndex(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="text-base font-semibold">{albumName}</DialogTitle>

          {activeItem && (
            <>
              <div className="relative flex max-h-[65vh] w-full items-center justify-center overflow-hidden border border-border/70 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.image}
                  alt={activeItem.caption ?? albumName}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />

                {items.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                      onClick={prev}
                    >
                      <ChevronLeft className="size-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                      onClick={next}
                    >
                      <ChevronRight className="size-5" />
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                {activeItem.caption ? (
                  <p className="text-sm text-muted-foreground">{activeItem.caption}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground shrink-0">
                  {(activeIndex ?? 0) + 1} / {items.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
