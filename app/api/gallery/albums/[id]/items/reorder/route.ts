import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryItems } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { reorderItemsSchema } from "@/lib/validations/gallery.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:gallery:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id: albumId } = await params;
    const updates = await parseBody(req, reorderItemsSchema);

    await db.transaction(async (tx) => {
      for (const { itemId, order } of updates) {
        await tx
          .update(galleryItems)
          .set({ order })
          .where(eq(galleryItems.id, itemId));
      }
    });

    const items = await db.select().from(galleryItems).where(eq(galleryItems.albumId, albumId));
    return ok(items);
  } catch (err) {
    return handleApiError(err);
  }
}
