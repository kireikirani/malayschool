import { asc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryAlbums, galleryItems } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createGalleryItemsSchema } from "@/lib/validations/gallery.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id: albumId } = await params;
    const items = await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.albumId, albumId))
      .orderBy(asc(galleryItems.order));
    return ok(items);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:gallery:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id: albumId } = await params;
    const [album] = await db.select({ id: galleryAlbums.id }).from(galleryAlbums).where(eq(galleryAlbums.id, albumId)).limit(1);
    if (!album) return fail("Album not found", 404);

    const items = await parseBody(req, createGalleryItemsSchema);

    const [{ maxOrder }] = await db
      .select({ maxOrder: max(galleryItems.order) })
      .from(galleryItems)
      .where(eq(galleryItems.albumId, albumId));

    let nextOrder = (maxOrder ?? -1) + 1;
    const rows = items.map((item) => ({
      id: crypto.randomUUID(),
      albumId,
      image: item.image,
      caption: item.caption,
      order: nextOrder++,
    }));

    await db.insert(galleryItems).values(rows);
    return created(rows);
  } catch (err) {
    return handleApiError(err);
  }
}
