"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchGdriveImagesAction, type GdriveImage } from "@/app/(public)/asrama/senarai-pelajar/actions";

export function GdriveCarousel({
  folderLink,
  studentName,
  open,
  onOpenChange,
}: {
  folderLink: string;
  studentName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [images, setImages] = useState<GdriveImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const loadImages = useCallback(async () => {
    if (!folderLink || images.length > 0) return;
    setIsLoading(true);
    setError(null);
    const res = await fetchGdriveImagesAction(folderLink);
    if (res.success) {
      setImages(res.images);
    } else {
      setError(res.error);
    }
    setIsLoading(false);
  }, [folderLink, images.length]);

  useEffect(() => {
    if (open && folderLink) {
      loadImages();
    }
    if (!open) {
      setCurrentIndex(0);
    }
  }, [open, folderLink, loadImages]);

  const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4 pb-2">
            <DialogTitle className="text-base font-heading">
              Gambar {studentName}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </div>
            )}

            {!isLoading && !error && images.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">Tiada gambar dijumpai dalam folder ini.</p>
              </div>
            )}

            {!isLoading && !error && images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[currentIndex].url}
                    alt={images[currentIndex].name}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={prev}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={next}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {currentIndex + 1} / {images.length}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`shrink-0 size-14 rounded-md overflow-hidden border-2 transition-colors ${
                          i === currentIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-size lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-black/90 border-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{images[currentIndex].name}</DialogTitle>
            </DialogHeader>
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex].url}
                alt={images[currentIndex].name}
                className="max-w-full max-h-[85vh] object-contain"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                    onClick={prev}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                    onClick={next}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
