"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
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

type MediaItem = { id: string; fileName: string; filePath: string };

export function ImagePicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[] | null>(null);

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

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image src={value} alt="Preview" fill className="object-cover" />
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
            <UploadDropzone
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                const first = res[0];
                if (first) select(first.ufsUrl);
              }}
              onUploadError={(err) => {
                toast.error(err.message);
              }}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Atau pilih dari media yang sudah ada</p>
              <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto">
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
                    <Image src={item.filePath} alt={item.fileName} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
