import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateAsramaPelajarSchema } from "@/lib/validations/asrama-pelajar.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(asramaPelajar).where(eq(asramaPelajar.id, Number(id))).limit(1);
    if (!row) return notFound("Rekod tidak ditemui");
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-pelajar:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);
    const body = await parseBody(req, updateAsramaPelajarSchema);

    const [existing] = await db.select({ id: asramaPelajar.id }).from(asramaPelajar).where(eq(asramaPelajar.id, numId)).limit(1);
    if (!existing) return notFound("Rekod tidak ditemui");

    await db.update(asramaPelajar).set({ ...body, updatedAt: new Date() }).where(eq(asramaPelajar.id, numId));
    const [row] = await db.select().from(asramaPelajar).where(eq(asramaPelajar.id, numId)).limit(1);
    if (!row) return notFound("Rekod tidak ditemui");
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-pelajar:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);

    const [existing] = await db.select({ id: asramaPelajar.id }).from(asramaPelajar).where(eq(asramaPelajar.id, numId)).limit(1);
    if (!existing) throw new ApiError("Rekod tidak ditemui", 404);

    await db.delete(asramaPelajar).where(eq(asramaPelajar.id, numId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
