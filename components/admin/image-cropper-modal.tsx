"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCroppedBlob, uploadSingleFile } from "@/lib/upload-file";

type Props = {
  open: boolean;
  imageDataUrl: string;
  fileName: string;
  aspect?: number;
  onClose: () => void;
  onDone: (url: string) => void;
};

export function ImageCropperModal({ open, imageDataUrl, fileName, aspect, onClose, onDone }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleCropAndUpload() {
    if (!croppedAreaPixels) return;
    setIsUploading(true);
    try {
      const file = await getCroppedBlob(imageDataUrl, croppedAreaPixels, fileName);
      const result = await uploadSingleFile(file);
      onDone(result.url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isUploading) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sesuaikan Gambar</DialogTitle>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-md bg-black">
          <Cropper
            image={imageDataUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
          <Slider
            min={1}
            max={3}
            step={0.05}
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            className="flex-1"
          />
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Batal
          </Button>
          <Button onClick={handleCropAndUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Memuat naik...
              </>
            ) : (
              "Potong & Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
