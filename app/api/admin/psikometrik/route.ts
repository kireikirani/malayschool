import { and, asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { psikometrikResults } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createPsikometrikSchema, psikometrikQuerySchema } from "@/lib/validations/psikometrik.schema";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { page, limit, q, namaKelas } = parseQuery(new URL(req.url).searchParams, psikometrikQuerySchema);

    const conditions = [];
    if (q) conditions.push(sql`(LOWER(${psikometrikResults.namaMurid}) LIKE ${`%${q.toLowerCase()}%`} OR ${psikometrikResults.noPengenalan} LIKE ${`%${q}%`})`);
    if (namaKelas) conditions.push(eq(psikometrikResults.namaKelas, namaKelas));

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select({
        id: psikometrikResults.id,
        noPengenalan: psikometrikResults.noPengenalan,
        namaMurid: psikometrikResults.namaMurid,
        kodSekolah: psikometrikResults.kodSekolah,
        namaSekolah: psikometrikResults.namaSekolah,
        namaKelas: psikometrikResults.namaKelas,
        tarikh: psikometrikResults.tarikh,
        createdAt: psikometrikResults.createdAt,
      })
        .from(psikometrikResults)
        .where(where)
        .orderBy(asc(psikometrikResults.namaMurid))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(psikometrikResults).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await parseBody(req, createPsikometrikSchema);
    const { scores, ...rest } = body;
    const [result] = await db.insert(psikometrikResults).values({ ...rest, scoresJson: JSON.stringify(scores) });
    const [row] = await db.select().from(psikometrikResults).where(eq(psikometrikResults.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
