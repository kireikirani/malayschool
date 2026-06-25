import { and, asc, count, eq, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin, getSession } from "@/lib/api/with-auth";
import { createTeacherSchema, teacherQuerySchema } from "@/lib/validations/teacher.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    const isAdmin = session?.user.role === "admin";

    const { page, limit, q, status, sort } = parseQuery(
      new URL(req.url).searchParams,
      teacherQuerySchema,
    );

    const conditions = [];
    if (!isAdmin) {
      conditions.push(eq(teachers.status, "active"));
    } else if (status) {
      conditions.push(eq(teachers.status, status));
    }
    if (q) conditions.push(like(teachers.name, `%${q}%`));

    const where = conditions.length ? and(...conditions) : undefined;
    const orderColumn = sort === "position" ? teachers.position : teachers.name;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(teachers).where(where).orderBy(asc(orderColumn)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(teachers).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:teachers:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createTeacherSchema);
    const id = crypto.randomUUID();
    await db.insert(teachers).values({ id, ...body });

    const [row] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
