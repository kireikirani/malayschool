import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pengumuman } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin, getSession } from "@/lib/api/with-auth";
import { createPengumumanSchema, pengumumanQuerySchema } from "@/lib/validations/pengumuman.schema";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    const isAdmin = session?.user.role === "admin";

    const { page, limit, aktif } = parseQuery(
      new URL(req.url).searchParams,
      pengumumanQuerySchema,
    );

    const conditions = [];
    if (!isAdmin) {
      conditions.push(eq(pengumuman.aktif, true));
    } else if (aktif !== undefined) {
      conditions.push(eq(pengumuman.aktif, aktif));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(pengumuman).where(where).orderBy(asc(pengumuman.sortOrder), asc(pengumuman.createdAt)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(pengumuman).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await parseBody(req, createPengumumanSchema);
    const [result] = await db.insert(pengumuman).values({
      ...body,
      tamatPada: body.tamatPada ? new Date(body.tamatPada) : null,
      linkUrl: body.linkUrl || null,
    });
    const [row] = await db.select().from(pengumuman).where(eq(pengumuman.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
