import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { publicContent, publicContentItems } from "@/db/schema";
import { ContentSectionForm } from "@/components/admin/content-section-form";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPublicContentPage({ params }: PageProps) {
  const { id } = await params;
  const contentId = Number(id);
  const [row] = await db.select().from(publicContent).where(eq(publicContent.id, contentId)).limit(1);
  if (!row) notFound();

  const items = await db.select().from(publicContentItems).where(eq(publicContentItems.contentId, contentId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Edit Public Content</h1>
        <p className="text-sm text-muted-foreground">Kemaskini seksyen public content dan item-itemnya.</p>
      </div>
      <ContentSectionForm
        mode="public"
        action="edit"
        redirectTo="/admin/content"
        pageOptions={["home", "about", "asrama", "borang"]}
        initialValue={{
          ...row,
          pageKey: row.pageKey,
          items: items.map((item) => ({
            id: item.id,
            label: item.label,
            title: item.title,
            value: item.value,
            body: item.body,
            url: item.url,
            fileUrl: item.fileUrl,
            imageUrl: item.imageUrl,
            meta: item.metaJson ? JSON.parse(item.metaJson) : null,
            sortOrder: item.sortOrder,
          })),
        }}
      />
    </div>
  );
}
