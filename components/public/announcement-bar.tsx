import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AnnouncementBar({ message }: { message?: string }) {
  return (
    <div className="border-b border-primary/20 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-center text-xs font-medium sm:text-sm">
        <span className="truncate">
          {message ?? "Pendaftaran sesi baharu kini dibuka — tempat terhad."}
        </span>
        <Link
          href="/news"
          className="inline-flex shrink-0 items-center gap-1 text-primary-foreground/90 underline-offset-4 hover:text-gold hover:underline"
        >
          Lihat berita
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
