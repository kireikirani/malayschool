export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { news } from "@/db/schema";
import { StatusBadge } from "@/components/admin/status-badge";
import { NewsContent } from "@/components/public/news-content";

export default async function PreviewNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);

  if (!row) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <StatusBadge status={row.status} />
        <span className="text-sm text-muted-foreground">Mode pratinjau</span>
      </div>
      <h1 className="text-3xl font-semibold">{row.title}</h1>
      {row.thumbnail && (
        <div className="relative aspect-video overflow-hidden rounded-md">
          <Image src={row.thumbnail} alt={row.title} fill className="object-cover" />
        </div>
      )}
      <NewsContent markdown={row.content} />
    </article>
  );
}
