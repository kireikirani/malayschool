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
      <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50">
        <div className="relative aspect-video bg-muted">
          {coverImage && <Image src={coverImage} alt={name} fill className="object-cover" />}
        </div>
        <CardContent className="space-y-1 pt-4">
          <h3 className="font-medium">{name}</h3>
          {typeof itemCount === "number" && <p className="text-sm text-muted-foreground">{itemCount} foto</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
