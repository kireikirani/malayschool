import { and, asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createAsramaPelajarSchema, asramaPelajarQuerySchema } from "@/lib/validations/asrama-pelajar.schema";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { page, limit, q, jantina, status, tingkatan } = parseQuery(
      new URL(req.url).searchParams,
      asramaPelajarQuerySchema,
    );

    const conditions = [];
    if (jantina) conditions.push(eq(asramaPelajar.jantina, jantina));
    if (status) conditions.push(eq(asramaPelajar.status, status));
    if (tingkatan) conditions.push(eq(asramaPelajar.tingkatan, tingkatan));
    if (q) conditions.push(sql`LOWER(${asramaPelajar.nama}) LIKE ${`%${q.toLowerCase()}%`}`);

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(asramaPelajar).where(where).orderBy(asc(asramaPelajar.nama)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(asramaPelajar).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await parseBody(req, createAsramaPelajarSchema);
    const [result] = await db.insert(asramaPelajar).values(body);
    const [row] = await db.select().from(asramaPelajar).where(eq(asramaPelajar.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
