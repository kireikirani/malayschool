import { eq, and, or, like, isNull, inArray, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPermohonan } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { getSessionOrThrow } from "@/lib/api/with-auth";
import { ok } from "@/lib/api/response";

export async function GET(req: Request) {
  try {
    const session = await getSessionOrThrow(req);
    if (session.user.role !== "admin" && session.user.role !== "guard") {
      throw new ApiError("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const id = searchParams.get("id")?.trim();

    // If a specific ID is requested, return that details
    if (id) {
      const [row] = await db
        .select()
        .from(asramaPermohonan)
        .where(eq(asramaPermohonan.id, Number(id)))
        .limit(1);
      if (!row) throw new ApiError("Permohonan tidak dijumpai", 404);
      return ok(row);
    }

    // 1. Get Counters: Count of active (approved or mc) permohonan that have not been checked out yet
    const counts = await db
      .select({
        status: asramaPermohonan.status,
        count: count(),
      })
      .from(asramaPermohonan)
      .where(
        and(
          inArray(asramaPermohonan.status, ["diluluskan", "mc"]),
          isNull(asramaPermohonan.tarikhDiambil)
        )
      )
      .groupBy(asramaPermohonan.status);

    const counters = {
      diluluskan: counts.find((c) => c.status === "diluluskan")?.count ?? 0,
      mc: counts.find((c) => c.status === "mc")?.count ?? 0,
    };

    // 2. Fetch rows based on search query 'q'
    let rows: (typeof asramaPermohonan.$inferSelect)[] = [];
    if (q) {
      rows = await db
        .select()
        .from(asramaPermohonan)
        .where(
          and(
            inArray(asramaPermohonan.status, ["diluluskan", "mc"]),
            or(
              like(asramaPermohonan.namaPelajar, `%${q}%`),
              like(asramaPermohonan.tingkatan, `%${q}%`),
              like(asramaPermohonan.dorm, `%${q}%`)
            )
          )
        )
        .orderBy(asramaPermohonan.tarikhKeluar);
    }

    return ok({
      counters,
      rows,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
