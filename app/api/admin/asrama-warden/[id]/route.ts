import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaWardens } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateAsramaWardenSchema } from "@/lib/validations/asrama-warden.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(asramaWardens).where(eq(asramaWardens.id, Number(id))).limit(1);
    if (!row) return notFound();
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-warden:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const body = await parseBody(req, updateAsramaWardenSchema);

    await db.update(asramaWardens).set({
      ...(body.teacherId !== undefined && { teacherId: body.teacherId }),
      ...(body.jawatan !== undefined && { jawatan: body.jawatan }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    }).where(eq(asramaWardens.id, Number(id)));

    const [row] = await db.select().from(asramaWardens).where(eq(asramaWardens.id, Number(id))).limit(1);
    if (!row) return notFound();
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-warden:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    await db.delete(asramaWardens).where(eq(asramaWardens.id, Number(id)));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
