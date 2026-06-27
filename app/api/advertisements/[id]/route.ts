import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { ok, fail, noContent } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createAdvertisementSchema, updateAdvertisementSchema } from "@/lib/validations/advertisement.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
    if (!row) return fail("Not found", 404);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:advertisements:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, updateAdvertisementSchema);

    const [existing] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
    if (!existing) return fail("Not found", 404);

    createAdvertisementSchema.parse({
      ...existing,
      ...body,
    });

    await db.update(advertisements).set(body).where(eq(advertisements.id, id));
    const [row] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:advertisements:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const [existing] = await db
      .select({ id: advertisements.id })
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    if (!existing) throw new ApiError("Not found", 404);

    await db.delete(advertisements).where(eq(advertisements.id, id));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
