import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitJkDocuments } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createUnitJkDocSchema, unitJkDocQuerySchema } from "@/lib/validations/unit-jk-doc.schema";

export async function GET(req: Request) {
  try {
    const { page, limit, unitSlug, jkCode } = parseQuery(
      new URL(req.url).searchParams,
      unitJkDocQuerySchema,
    );

    const conditions = [];
    if (unitSlug) conditions.push(eq(unitJkDocuments.unitSlug, unitSlug));
    if (jkCode) conditions.push(eq(unitJkDocuments.jkCode, jkCode));

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(unitJkDocuments)
        .where(where)
        .orderBy(asc(unitJkDocuments.sortOrder), asc(unitJkDocuments.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(unitJkDocuments).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await parseBody(req, createUnitJkDocSchema);
    const [result] = await db.insert(unitJkDocuments).values(body);
    const [row] = await db
      .select()
      .from(unitJkDocuments)
      .where(eq(unitJkDocuments.id, result.insertId))
      .limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
