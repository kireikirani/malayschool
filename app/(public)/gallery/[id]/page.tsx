import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { galleryAlbums, galleryItems } from "@/db/schema";
import { GalleryLightbox } from "./lightbox";
import { GDriveFolderEmbed } from "@/components/public/gdrive-folder-embed";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const [album] = await db
    .select({ name: galleryAlbums.name, description: galleryAlbums.description })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, id))
    .limit(1);
  if (!album) return {};
  return {
    title: album.name,
    description: album.description ?? `Koleksi foto ${album.name}`,
    openGraph: {
      title: album.name,
      description: album.description ?? `Koleksi foto ${album.name}`,
    },
  };
}

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
  if (!album) notFound();

  const items = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.albumId, id))
    .orderBy(asc(galleryItems.order));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:py-14">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{album.name}</h1>
        {album.tarikh && <p className="text-sm text-muted-foreground">{album.tarikh}</p>}
        {album.description && <p className="text-muted-foreground">{album.description}</p>}
      </div>

      {items.length === 0 && album.linkGdrive ? (
        <GDriveFolderEmbed url={album.linkGdrive} title={album.name} />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada foto di album ini.</p>
      ) : (
        <>
          <GalleryLightbox
            items={items.map((i) => ({ id: i.id, image: i.image, caption: i.caption }))}
            albumName={album.name}
            tarikh={album.tarikh}
            linkGdrive={album.linkGdrive}
          />
          {album.linkGdrive && (
            <GDriveFolderEmbed url={album.linkGdrive} title={album.name} />
          )}
        </>
      )}
    </div>
  );
}
