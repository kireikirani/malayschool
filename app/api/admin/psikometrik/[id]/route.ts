import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { psikometrikResults } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { updatePsikometrikSchema } from "@/lib/validations/psikometrik.schema";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(psikometrikResults).where(eq(psikometrikResults.id, Number(id))).limit(1);
    if (!row) return notFound("Rekod tidak ditemui");
    return ok({ ...row, scores: JSON.parse(row.scoresJson) as Record<string, number> });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:psikometrik:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);
    const body = await parseBody(req, updatePsikometrikSchema);

    const [existing] = await db.select({ id: psikometrikResults.id }).from(psikometrikResults).where(eq(psikometrikResults.id, numId)).limit(1);
    if (!existing) return notFound("Rekod tidak ditemui");

    const { scores, ...rest } = body;
    const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if (scores !== undefined) updateData.scoresJson = JSON.stringify(scores);

    await db.update(psikometrikResults).set(updateData).where(eq(psikometrikResults.id, numId));
    const [row] = await db.select().from(psikometrikResults).where(eq(psikometrikResults.id, numId)).limit(1);
    if (!row) return notFound("Rekod tidak ditemui");
    return ok({ ...row, scores: JSON.parse(row.scoresJson) as Record<string, number> });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:psikometrik:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);

    const [existing] = await db.select({ id: psikometrikResults.id }).from(psikometrikResults).where(eq(psikometrikResults.id, numId)).limit(1);
    if (!existing) throw new ApiError("Rekod tidak ditemui", 404);

    await db.delete(psikometrikResults).where(eq(psikometrikResults.id, numId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
