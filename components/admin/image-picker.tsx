"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Crop, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { apiGet } from "@/lib/fetcher";
import { ImageCropperModal } from "@/components/admin/image-cropper-modal";

type MediaItem = { id: string; fileName: string; filePath: string };

export function ImagePicker({
  value,
  onChange,
  cropAspect,
}: {
  value?: string;
  onChange: (url: string) => void;
  cropAspect?: number;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && media === null) {
      apiGet<MediaItem[]>(`/api/media?folder=general`)
        .then(setMedia)
        .catch(() => setMedia([]));
    }
  }, [open, media]);

  function select(url: string) {
    onChange(url);
    setOpen(false);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCropDone(url: string) {
    setCropSrc(null);
    toast.success("Gambar berjaya dimuat naik");
    select(url);
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image src={value} alt="Preview" fill className="object-cover object-top" />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            {value ? "Ganti Gambar" : "Pilih Gambar"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pilih Gambar</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload with crop */}
            <div data-tour="image-picker-crop" className="flex items-center gap-3 rounded-md border border-dashed border-muted-foreground/30 bg-muted/10 px-4 py-3">
              <Crop className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Upload & Crop</p>
                <p className="text-xs text-muted-foreground">Pilih gambar dan sesuaikan kawasan crop sebelum simpan.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Pilih & Crop
              </Button>
            </div>

            {/* Quick upload (no crop) */}
            <UploadDropzone
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                const first = res[0];
                if (first) {
                  setMedia((current) =>
                    current
                      ? [{ id: first.key, fileName: first.name, filePath: first.ufsUrl }, ...current]
                      : [{ id: first.key, fileName: first.name, filePath: first.ufsUrl }],
                  );
                  toast.success("Gambar berjaya dimuat naik");
                  select(first.ufsUrl);
                }
              }}
              onUploadError={(err) => {
                toast.error(err.message);
              }}
            />

            {/* Media library */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Atau pilih dari media yang sudah ada</p>
              <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto">
                {media === null && <p className="text-sm text-muted-foreground">Memuat...</p>}
                {media?.length === 0 && (
                  <div className="col-span-full">
                    <EmptyState
                      compact
                      icon={ImageIcon}
                      title="Belum ada gambar"
                      description="Upload gambar terlebih dahulu agar dapat dipilih dari perpustakaan media."
                    />
                  </div>
                )}
                {media?.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(item.filePath)}
                    className="relative aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-ring"
                  >
                    <Image src={item.filePath} alt={item.fileName} fill className="object-cover object-top" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cropSrc && (
        <ImageCropperModal
          open={!!cropSrc}
          imageDataUrl={cropSrc}
          fileName={cropFileName}
          aspect={cropAspect}
          onClose={() => setCropSrc(null)}
          onDone={handleCropDone}
        />
      )}
    </div>
  );
}
