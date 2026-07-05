import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitJkMembers } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createUnitJkSchema, unitJkQuerySchema } from "@/lib/validations/unit-jk.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { page, limit, unitSlug, jkCode } = parseQuery(new URL(req.url).searchParams, unitJkQuerySchema);

    const conditions = [];
    if (unitSlug) conditions.push(eq(unitJkMembers.unitSlug, unitSlug));
    if (jkCode) conditions.push(eq(unitJkMembers.jkCode, jkCode));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(unitJkMembers).where(where).orderBy(asc(unitJkMembers.unitSlug), asc(unitJkMembers.jkCode), asc(unitJkMembers.sortOrder)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(unitJkMembers).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:unit-jk:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createUnitJkSchema);
    const [result] = await db.insert(unitJkMembers).values({
      unitSlug: body.unitSlug,
      jkCode: body.jkCode,
      jkTitle: body.jkTitle,
      nama: body.nama,
      jawatan: body.jawatan,
      sortOrder: body.sortOrder,
    });

    const [row] = await db.select().from(unitJkMembers).where(eq(unitJkMembers.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
