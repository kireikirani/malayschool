import { and, count, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin, getSession } from "@/lib/api/with-auth";
import { advertisementQuerySchema, createAdvertisementSchema } from "@/lib/validations/advertisement.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    const isAdmin = session?.user.role === "admin";

    const { page, limit, placement, status } = parseQuery(
      new URL(req.url).searchParams,
      advertisementQuerySchema,
    );

    const conditions = [];
    if (placement) conditions.push(eq(advertisements.placement, placement));

    if (!isAdmin) {
      const now = new Date();
      conditions.push(eq(advertisements.status, "active"));
      conditions.push(or(isNull(advertisements.startDate), lte(advertisements.startDate, now)));
      conditions.push(or(isNull(advertisements.endDate), gte(advertisements.endDate, now)));
    } else if (status) {
      conditions.push(eq(advertisements.status, status));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(advertisements).where(where).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(advertisements).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:advertisements:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createAdvertisementSchema);
    const id = crypto.randomUUID();
    await db.insert(advertisements).values({ id, ...body });

    const [row] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
