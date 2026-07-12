import Link from "next/link";
import Image from "next/image";
import { FileText, Calendar } from "lucide-react";

export function NewsCard({
  id,
  title,
  thumbnail,
  publishDate,
}: {
  id: string;
  title: string;
  thumbnail?: string | null;
  publishDate?: string | null;
}) {
  return (
    <Link href={`/news/${id}`} className="group mx-auto block h-full w-[85%]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-none bg-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-24px_rgba(35,24,16,0.6)]">
        {thumbnail ? (
          <Image src={thumbnail} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <FileText className="size-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading text-base font-semibold leading-snug text-white drop-shadow-sm line-clamp-3">{title}</h3>
          {publishDate && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70">
              <Calendar className="size-3" aria-hidden />
              {new Date(publishDate).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
