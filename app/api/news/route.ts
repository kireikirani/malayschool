import { and, count, desc, eq, gte, like, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { news } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin, getSession } from "@/lib/api/with-auth";
import { createNewsSchema, newsQuerySchema } from "@/lib/validations/news.schema";
import { slugify } from "@/lib/validations/common.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    const isAdmin = session?.user.role === "admin";

    const { page, limit, q, status, from, to } = parseQuery(
      new URL(req.url).searchParams,
      newsQuerySchema,
    );

    const conditions = [];
    if (!isAdmin) {
      conditions.push(eq(news.status, "published"));
    } else if (status) {
      conditions.push(eq(news.status, status));
    }
    if (q) conditions.push(like(news.title, `%${q}%`));
    if (from) conditions.push(gte(news.publishDate, from));
    if (to) conditions.push(lte(news.publishDate, to));

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(news)
        .where(where)
        .orderBy(desc(news.publishDate))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(news).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    if (!rateLimit(`${getClientIp(req)}:news:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createNewsSchema);
    const slug = slugify(body.slug || body.title);

    const existing = await db.select({ id: news.id }).from(news).where(eq(news.slug, slug)).limit(1);
    if (existing.length > 0) {
      return fail("A news article with this slug already exists", 409);
    }

    const id = crypto.randomUUID();
    await db.insert(news).values({ id, ...body, slug });

    const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
