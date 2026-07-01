import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pengumuman } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updatePengumumanSchema } from "@/lib/validations/pengumuman.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(pengumuman).where(eq(pengumuman.id, Number(id))).limit(1);
    if (!row) return notFound("Pengumuman tidak ditemui");
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:pengumuman:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);
    const body = await parseBody(req, updatePengumumanSchema);

    const [existing] = await db.select({ id: pengumuman.id }).from(pengumuman).where(eq(pengumuman.id, numId)).limit(1);
    if (!existing) return notFound("Pengumuman tidak ditemui");

    await db.update(pengumuman).set({
      ...body,
      tamatPada: body.tamatPada !== undefined ? (body.tamatPada ? new Date(body.tamatPada) : null) : undefined,
      linkUrl: body.linkUrl !== undefined ? (body.linkUrl || null) : undefined,
      updatedAt: new Date(),
    }).where(eq(pengumuman.id, numId));

    const [row] = await db.select().from(pengumuman).where(eq(pengumuman.id, numId)).limit(1);
    if (!row) return notFound("Pengumuman tidak ditemui");
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:pengumuman:write`, 20, 60_000)) {
      return notFound("Too many requests");
    }

    const { id } = await params;
    const numId = Number(id);

    const [existing] = await db.select({ id: pengumuman.id }).from(pengumuman).where(eq(pengumuman.id, numId)).limit(1);
    if (!existing) throw new ApiError("Pengumuman tidak ditemui", 404);

    await db.delete(pengumuman).where(eq(pengumuman.id, numId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
