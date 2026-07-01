import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitDocuments } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateUnitDokumenSchema } from "@/lib/validations/unit-dokumen.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(unitDocuments).where(eq(unitDocuments.id, Number(id))).limit(1);
    if (!row) return notFound("Dokumen tidak ditemui");
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-dokumen:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);
    const body = await parseBody(req, updateUnitDokumenSchema);

    const [existing] = await db.select({ id: unitDocuments.id }).from(unitDocuments).where(eq(unitDocuments.id, numId)).limit(1);
    if (!existing) throw new ApiError("Dokumen tidak ditemui", 404);

    await db.update(unitDocuments).set({ ...body, updatedAt: new Date() }).where(eq(unitDocuments.id, numId));
    const [row] = await db.select().from(unitDocuments).where(eq(unitDocuments.id, numId)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-dokumen:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);

    const [existing] = await db.select({ id: unitDocuments.id }).from(unitDocuments).where(eq(unitDocuments.id, numId)).limit(1);
    if (!existing) throw new ApiError("Dokumen tidak ditemui", 404);

    await db.delete(unitDocuments).where(eq(unitDocuments.id, numId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
