import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitJkDocuments } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateUnitJkDocSchema } from "@/lib/validations/unit-jk-doc.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-jk-docs:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);
    const body = await parseBody(req, updateUnitJkDocSchema);

    const [existing] = await db
      .select({ id: unitJkDocuments.id })
      .from(unitJkDocuments)
      .where(eq(unitJkDocuments.id, numId))
      .limit(1);
    if (!existing) throw new ApiError("Dokumen tidak ditemui", 404);

    await db
      .update(unitJkDocuments)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(unitJkDocuments.id, numId));
    const [row] = await db
      .select()
      .from(unitJkDocuments)
      .where(eq(unitJkDocuments.id, numId))
      .limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-jk-docs:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);

    const [existing] = await db
      .select({ id: unitJkDocuments.id })
      .from(unitJkDocuments)
      .where(eq(unitJkDocuments.id, numId))
      .limit(1);
    if (!existing) throw new ApiError("Dokumen tidak ditemui", 404);

    await db.delete(unitJkDocuments).where(eq(unitJkDocuments.id, numId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
