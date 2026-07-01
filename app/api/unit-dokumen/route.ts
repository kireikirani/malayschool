import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitDocuments } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createUnitDokumenSchema, unitDokumenQuerySchema } from "@/lib/validations/unit-dokumen.schema";

export async function GET(req: Request) {
  try {
    const { page, limit, unitSlug, type } = parseQuery(
      new URL(req.url).searchParams,
      unitDokumenQuerySchema,
    );

    const conditions = [];
    if (unitSlug) conditions.push(eq(unitDocuments.unitSlug, unitSlug));
    if (type) conditions.push(eq(unitDocuments.type, type));

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(unitDocuments).where(where).orderBy(asc(unitDocuments.sortOrder), asc(unitDocuments.createdAt)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(unitDocuments).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await parseBody(req, createUnitDokumenSchema);
    const [result] = await db.insert(unitDocuments).values(body);
    const [row] = await db.select().from(unitDocuments).where(eq(unitDocuments.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
