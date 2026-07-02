import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

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
    <Link href={`/gallery/${id}`}>
      <Card className="pt-0! h-full overflow-hidden border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_36px_-28px_rgba(35,24,16,0.55)]">
        <div className="relative aspect-[4/3] border-b border-border/70 bg-muted">
          {coverImage && <Image src={coverImage} alt={name} fill className="object-cover" />}
        </div>
        <CardContent className="space-y-2 pt-5 pb-1">
          <h3 className="text-lg font-medium tracking-tight">{name}</h3>
          {typeof itemCount === "number" && <p className="text-sm text-muted-foreground">{itemCount} foto</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
