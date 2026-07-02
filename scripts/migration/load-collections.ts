import { db } from "@/lib/db";
import { advertisements, asramaPelajar, galleryAlbums, galleryItems, news, pengumuman, teachers, unitDocuments } from "@/db/schema";
import { getMigrationConfig } from "./config";
import type { LegacyPayload } from "./types";
import { getTransformedPayloadPath, logDryRun, readJsonFile } from "./utils";

export const COLLECTION_ORDER = [
  "teachers",
  "advertisements",
  "pengumuman",
  "news",
  "gallery",
  "asrama",
  "unitDocuments",
] as const;

export function summarizeCollectionCounts(payload: LegacyPayload) {
  return {
    teachers: payload.teachers.length,
    advertisements: payload.advertisements.length,
    pengumuman: payload.pengumuman.length,
    news: payload.news.length,
    gallery: payload.gallery.reduce((total, album) => total + 1 + album.items.length, 0),
    asrama: payload.asrama.length,
    unitDocuments: payload.unitDocuments.length,
  };
}

export async function loadCollections(payload: LegacyPayload, dryRun = false) {
  if (dryRun) {
    logDryRun("collection-counts", summarizeCollectionCounts(payload));
    return;
  }

  if (payload.teachers.length) {
    for (const item of payload.teachers) {
      await db.insert(teachers).values(item).onDuplicateKeyUpdate({
        set: {
          name: item.name,
          position: item.position,
          photo: item.photo,
          biography: item.biography,
          status: item.status,
        },
      });
    }
  }

  if (payload.advertisements.length) {
    for (const item of payload.advertisements) {
      await db.insert(advertisements).values(item).onDuplicateKeyUpdate({
        set: {
          name: item.name,
          type: item.type,
          placement: item.placement,
          content: item.content,
          status: item.status,
          startDate: item.startDate,
          endDate: item.endDate,
        },
      });
    }
  }

  if (payload.pengumuman.length) {
    await db.insert(pengumuman).values(payload.pengumuman);
  }

  if (payload.news.length) {
    for (const item of payload.news) {
      await db.insert(news).values(item).onDuplicateKeyUpdate({
        set: {
          title: item.title,
          slug: item.slug,
          content: item.content,
          thumbnail: item.thumbnail,
          status: item.status,
          publishDate: item.publishDate,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          ogImage: item.ogImage,
          authorId: item.authorId,
        },
      });
    }
  }

  for (const album of payload.gallery) {
    await db.insert(galleryAlbums).values(album.album).onDuplicateKeyUpdate({
      set: {
        name: album.album.name,
        description: album.album.description,
        coverImage: album.album.coverImage,
      },
    });

    if (album.items.length) {
      for (const item of album.items) {
        await db.insert(galleryItems).values(item).onDuplicateKeyUpdate({
          set: {
            image: item.image,
            caption: item.caption,
            order: item.order,
          },
        });
      }
    }
  }

  if (payload.asrama.length) {
    await db.insert(asramaPelajar).values(payload.asrama);
  }

  if (payload.unitDocuments.length) {
    await db.insert(unitDocuments).values(payload.unitDocuments);
  }
}

async function main() {
  const config = getMigrationConfig();
  const payload = await readJsonFile<LegacyPayload>(getTransformedPayloadPath());
  await loadCollections(payload, config.dryRun);
  console.log(`${config.dryRun ? "Previewed" : "Loaded"} collection imports`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
