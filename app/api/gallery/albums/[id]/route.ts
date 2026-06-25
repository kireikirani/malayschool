import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryAlbums, galleryItems } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { ok, fail, noContent } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateAlbumSchema } from "@/lib/validations/gallery.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [album] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
    if (!album) return fail("Not found", 404);

    const items = await db
      .select()
      .from(galleryItems)
      .where(eq(galleryItems.albumId, id))
      .orderBy(asc(galleryItems.order));

    return ok({ ...album, items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:gallery:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, updateAlbumSchema);

    const [existing] = await db.select({ id: galleryAlbums.id }).from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
    if (!existing) return fail("Not found", 404);

    await db.update(galleryAlbums).set(body).where(eq(galleryAlbums.id, id));
    const [row] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:gallery:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const [existing] = await db.select({ id: galleryAlbums.id }).from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
    if (!existing) throw new ApiError("Not found", 404);

    await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
