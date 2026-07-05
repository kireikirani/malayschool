import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitJkMembers } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateUnitJkSchema } from "@/lib/validations/unit-jk.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(unitJkMembers).where(eq(unitJkMembers.id, Number(id))).limit(1);
    if (!row) return notFound();
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-jk:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const body = await parseBody(req, updateUnitJkSchema);

    await db.update(unitJkMembers).set({
      ...(body.unitSlug !== undefined && { unitSlug: body.unitSlug }),
      ...(body.jkCode !== undefined && { jkCode: body.jkCode }),
      ...(body.jkTitle !== undefined && { jkTitle: body.jkTitle }),
      ...(body.nama !== undefined && { nama: body.nama }),
      ...(body.jawatan !== undefined && { jawatan: body.jawatan }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    }).where(eq(unitJkMembers.id, Number(id)));

    const [row] = await db.select().from(unitJkMembers).where(eq(unitJkMembers.id, Number(id))).limit(1);
    if (!row) return notFound();
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-jk:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    await db.delete(unitJkMembers).where(eq(unitJkMembers.id, Number(id)));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
