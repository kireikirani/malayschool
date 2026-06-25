import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryItems } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { fail, noContent, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateGalleryItemSchema } from "@/lib/validations/gallery.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:gallery:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { itemId } = await params;
    const body = await parseBody(req, updateGalleryItemSchema);

    const [existing] = await db.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.id, itemId)).limit(1);
    if (!existing) return fail("Not found", 404);

    await db.update(galleryItems).set(body).where(eq(galleryItems.id, itemId));
    const [row] = await db.select().from(galleryItems).where(eq(galleryItems.id, itemId)).limit(1);
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

    const { itemId } = await params;
    const [existing] = await db.select({ id: galleryItems.id }).from(galleryItems).where(eq(galleryItems.id, itemId)).limit(1);
    if (!existing) throw new ApiError("Not found", 404);

    await db.delete(galleryItems).where(eq(galleryItems.id, itemId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
