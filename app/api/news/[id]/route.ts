import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { news } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { ok, fail, noContent } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin, getSession } from "@/lib/api/with-auth";
import { createNewsSchema, updateNewsSchema } from "@/lib/validations/news.schema";
import { slugify } from "@/lib/validations/common.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    if (!row) return fail("Not found", 404);

    if (row.status !== "published") {
      const session = await getSession(req);
      if (session?.user.role !== "admin") return fail("Not found", 404);
    }

    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:news:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, updateNewsSchema);

    const [existing] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    if (!existing) return fail("Not found", 404);

    const updates: Record<string, unknown> = { ...body };
    if (body.slug || body.title) {
      const slug = slugify(body.slug || body.title!);
      const [dup] = await db.select({ id: news.id }).from(news).where(eq(news.slug, slug)).limit(1);
      if (dup && dup.id !== id) return fail("A news article with this slug already exists", 409);
      updates.slug = slug;
    }

    createNewsSchema.parse({
      ...existing,
      ...body,
      ...updates,
    });

    await db.update(news).set(updates).where(eq(news.id, id));
    const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:news:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const [existing] = await db.select({ id: news.id }).from(news).where(eq(news.id, id)).limit(1);
    if (!existing) throw new ApiError("Not found", 404);

    await db.delete(news).where(eq(news.id, id));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
