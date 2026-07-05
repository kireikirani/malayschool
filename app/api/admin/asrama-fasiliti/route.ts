import { asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaFasiliti } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createAsramaFasilitiSchema, asramaFasilitiQuerySchema } from "@/lib/validations/asrama-fasiliti.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { page, limit } = parseQuery(new URL(req.url).searchParams, asramaFasilitiQuerySchema);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(asramaFasiliti).orderBy(asc(asramaFasiliti.sortOrder), asc(asramaFasiliti.id)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(asramaFasiliti),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-fasiliti:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createAsramaFasilitiSchema);
    const [result] = await db.insert(asramaFasiliti).values({
      iconName: body.iconName,
      label: body.label,
      sortOrder: body.sortOrder,
    });

    const [row] = await db.select().from(asramaFasiliti).where(eq(asramaFasiliti.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
