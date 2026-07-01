export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { news } from "@/db/schema";
import { NewsForm } from "../../_components/news-form";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);

  if (!row) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Berita</h1>
      <NewsForm
        newsId={row.id}
        initialData={{
          title: row.title,
          slug: row.slug,
          content: row.content,
          thumbnail: row.thumbnail ?? undefined,
          status: row.status,
          publishDate: row.publishDate ?? undefined,
          metaTitle: row.metaTitle ?? undefined,
          metaDescription: row.metaDescription ?? undefined,
          ogImage: row.ogImage ?? undefined,
        }}
      />
    </div>
  );
}
