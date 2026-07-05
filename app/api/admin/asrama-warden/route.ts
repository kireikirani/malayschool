import { asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaWardens } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createAsramaWardenSchema, asramaWardenQuerySchema } from "@/lib/validations/asrama-warden.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { page, limit } = parseQuery(new URL(req.url).searchParams, asramaWardenQuerySchema);

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(asramaWardens).orderBy(asc(asramaWardens.sortOrder), asc(asramaWardens.id)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(asramaWardens),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-warden:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createAsramaWardenSchema);
    const [result] = await db.insert(asramaWardens).values({
      nama: body.nama,
      jawatan: body.jawatan,
      telefon: body.telefon ?? null,
      foto: body.foto ?? null,
      sortOrder: body.sortOrder,
    });

    const [row] = await db.select().from(asramaWardens).where(eq(asramaWardens.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
