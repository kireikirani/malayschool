import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPermohonan } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { getSessionOrThrow } from "@/lib/api/with-auth";
import { ok, fail } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { approvePermohonanSchema } from "@/lib/validations/asrama-permohonan.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await getSessionOrThrow(req);
    // Allow both Admin and Teacher (Warden) to approve/reject permohonan
    if (session.user.role !== "admin" && session.user.role !== "teacher") {
      throw new ApiError("Forbidden", 403);
    }

    if (!rateLimit(`${getClientIp(req)}:admin-permohonan:approve`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, approvePermohonanSchema);

    const [permohonan] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    if (!permohonan) {
      throw new ApiError("Rekod permohonan tidak ditemui", 404);
    }

    // Update status and approval info
    await db
      .update(asramaPermohonan)
      .set({
        status: body.status,
        catatan: body.catatan || null,
        diluluskanOleh: session.user.name,
        approverUserId: session.user.id,
        tarikhKelulusan: new Date(),
      })
      .where(eq(asramaPermohonan.id, Number(id)));

    const [updated] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
