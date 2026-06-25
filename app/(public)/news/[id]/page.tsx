import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { news } from "@/db/schema";
import { NewsContent } from "@/components/public/news-content";
import { AdSlot } from "@/components/public/ad-slot";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);

  if (!row || row.status !== "published") notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-semibold">{row.title}</h1>
      {row.publishDate && (
        <p className="text-sm text-muted-foreground">{new Date(row.publishDate).toLocaleDateString("id-ID")}</p>
      )}
      {row.thumbnail && (
        <div className="relative aspect-video overflow-hidden rounded-md">
          <Image src={row.thumbnail} alt={row.title} fill className="object-cover" />
        </div>
      )}
      <NewsContent html={row.content} />
      <AdSlot placement="news_detail" />
    </article>
  );
}
