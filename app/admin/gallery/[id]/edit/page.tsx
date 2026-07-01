export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { galleryAlbums } from "@/db/schema";
import { AlbumForm } from "../../_components/album-form";

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);

  if (!row) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit Album</h1>
      <AlbumForm
        albumId={row.id}
        initialData={{
          name: row.name,
          description: row.description ?? undefined,
          coverImage: row.coverImage ?? undefined,
        }}
      />
    </div>
  );
}
