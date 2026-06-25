import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

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
    <Link href={`/news/${id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50">
        <div className="relative aspect-video bg-muted">
          {thumbnail && <Image src={thumbnail} alt={title} fill className="object-cover" />}
        </div>
        <CardContent className="space-y-1 pt-4">
          <h3 className="line-clamp-2 font-medium">{title}</h3>
          {publishDate && (
            <p className="text-sm text-muted-foreground">{new Date(publishDate).toLocaleDateString("id-ID")}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
