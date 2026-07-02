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
      <Card className="pt-0! h-full overflow-hidden border-border/70 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_18px_36px_-28px_rgba(35,24,16,0.55)]">
        <div className="relative aspect-[4/3] border-b border-border/70 bg-muted">
          {thumbnail && <Image src={thumbnail} alt={title} fill className="object-cover" />}
        </div>
        <CardContent className="space-y-2 pt-5 pb-1">
          <h3 className="line-clamp-2 text-lg font-medium tracking-tight">{title}</h3>
          {publishDate && (
            <p className="text-sm text-muted-foreground">{new Date(publishDate).toLocaleDateString("id-ID")}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
