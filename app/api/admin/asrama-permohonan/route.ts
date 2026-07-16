import { eq, and, or, like, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar, asramaPermohonan } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { requireAdmin } from "@/lib/api/with-auth";
import { created, fail, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { mcSchema } from "@/lib/validations/asrama-permohonan.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? "20"));
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status")?.trim();
    const jenis = searchParams.get("jenis")?.trim();

    // 1. Build Query Filters
    const filters: import("drizzle-orm").SQL[] = [];
    if (q) {
      const orFilter = or(
        like(asramaPermohonan.namaPelajar, `%${q}%`),
        like(asramaPermohonan.tingkatan, `%${q}%`),
        like(asramaPermohonan.dorm, `%${q}%`)
      );
      if (orFilter) {
        filters.push(orFilter);
      }
    }
    if (status && status !== "all") {
      filters.push(eq(asramaPermohonan.status, status as "menunggu" | "diluluskan" | "ditolak" | "mc"));
    }
    if (jenis && jenis !== "all") {
      filters.push(eq(asramaPermohonan.jenis, jenis as "pulang_bermalam" | "outing" | "mc_sakit"));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // 2. Fetch Paginated Rows & Total Count
    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(asramaPermohonan)
        .where(whereClause)
        .orderBy(desc(asramaPermohonan.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(asramaPermohonan)
        .where(whereClause),
    ]);

    // 3. Fetch Statistics (Count for waiting, approved, rejected, and mc status)
    const statsResult = await db
      .select({
        status: asramaPermohonan.status,
        count: count(),
      })
      .from(asramaPermohonan)
      .groupBy(asramaPermohonan.status);

    const stats = {
      menunggu: statsResult.find((s) => s.status === "menunggu")?.count ?? 0,
      diluluskan: statsResult.find((s) => s.status === "diluluskan")?.count ?? 0,
      ditolak: statsResult.find((s) => s.status === "ditolak")?.count ?? 0,
      mc: statsResult.find((s) => s.status === "mc")?.count ?? 0,
    };

    return ok({
      rows,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:admin-permohonan:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, mcSchema);

    // 1. Fetch student for snapshot
    const [student] = await db
      .select()
      .from(asramaPelajar)
      .where(eq(asramaPelajar.id, body.pelajarId))
      .limit(1);

    if (!student) {
      throw new ApiError("Pelajar tidak ditemui", 404);
    }

    // 2. Insert MC record
    const [result] = await db.insert(asramaPermohonan).values({
      pelajarId: student.id,
      namaPelajar: student.nama, // Snapshot
      tingkatan: student.tingkatan, // Snapshot
      dorm: student.dorm, // Snapshot
      jenis: "mc_sakit",
      tarikhKeluar: new Date(body.tarikhKeluar),
      tarikhPulang: null, // MC has no fixed return date
      sebab: body.sebab,
      status: "mc",
      noWarisPengirim: student.noWaris || "-",
      diluluskanOleh: session.user.name,
      approverUserId: session.user.id,
      tarikhKelulusan: new Date(),
    });

    const [row] = await db.select().from(asramaPermohonan).where(eq(asramaPermohonan.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
