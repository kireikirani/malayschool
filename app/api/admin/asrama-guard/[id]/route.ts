import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, asramaGuards } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateAsramaGuardSchema } from "@/lib/validations/asrama-guard.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db
      .select({
        id: asramaGuards.id,
        userId: asramaGuards.userId,
        nama: asramaGuards.nama,
        noTelefon: asramaGuards.noTelefon,
        status: asramaGuards.status,
        email: user.email,
      })
      .from(asramaGuards)
      .leftJoin(user, eq(asramaGuards.userId, user.id))
      .where(eq(asramaGuards.id, Number(id)))
      .limit(1);

    if (!row) return notFound();
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-guard:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const body = await parseBody(req, updateAsramaGuardSchema);

    const [guardRow] = await db.select().from(asramaGuards).where(eq(asramaGuards.id, Number(id))).limit(1);
    if (!guardRow) return notFound();

    // 1. Update asrama_guards row
    await db
      .update(asramaGuards)
      .set({
        ...(body.nama !== undefined && { nama: body.nama }),
        ...(body.noTelefon !== undefined && { noTelefon: body.noTelefon }),
        ...(body.status !== undefined && { status: body.status }),
      })
      .where(eq(asramaGuards.id, Number(id)));

    // 2. Also sync name back to the user table if it was updated
    if (body.nama && guardRow.userId) {
      await db
        .update(user)
        .set({ name: body.nama })
        .where(eq(user.id, guardRow.userId));
    }

    const [updatedRow] = await db.select().from(asramaGuards).where(eq(asramaGuards.id, Number(id))).limit(1);
    return ok(updatedRow);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-guard:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;

    const [guardRow] = await db.select().from(asramaGuards).where(eq(asramaGuards.id, Number(id))).limit(1);
    if (!guardRow) return notFound();

    // Delete the user, which cascades to delete the asrama_guards row
    if (guardRow.userId) {
      await db.delete(user).where(eq(user.id, guardRow.userId));
    } else {
      await db.delete(asramaGuards).where(eq(asramaGuards.id, Number(id)));
    }

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
