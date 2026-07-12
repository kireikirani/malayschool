import Link from "next/link";
import Image from "next/image";
import { Images } from "lucide-react";

export function GalleryAlbumCard({
  id,
  name,
  coverImage,
  itemCount,
}: {
  id: string;
  name: string;
  coverImage?: string | null;
  itemCount?: number;
}) {
  return (
    <Link href={`/gallery/${id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-24px_rgba(35,24,16,0.6)]">
        {coverImage ? (
          <Image src={coverImage} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <Images className="size-12" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading text-base font-semibold leading-tight text-white drop-shadow-sm">{name}</h3>
          {typeof itemCount === "number" && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
              <Images className="size-3" aria-hidden />
              {itemCount} foto
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
