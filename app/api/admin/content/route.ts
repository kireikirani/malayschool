import { and, asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { publicContent, publicContentItems } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createPublicContentSchema, publicContentQuerySchema } from "@/lib/validations/content.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { page, limit, pageKey } = parseQuery(new URL(req.url).searchParams, publicContentQuerySchema);
    const where = pageKey ? eq(publicContent.pageKey, pageKey) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(publicContent).where(where).orderBy(asc(publicContent.pageKey), asc(publicContent.sortOrder)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(publicContent).where(where),
    ]);

    if (!rows.length) {
      return paginated([], { page, limit, total, totalPages: Math.ceil(total / limit) });
    }

    const items = await db
      .select()
      .from(publicContentItems)
      .where(inArray(publicContentItems.contentId, rows.map((row) => row.id)))
      .orderBy(asc(publicContentItems.sortOrder), asc(publicContentItems.createdAt));

    const data = rows.map((row) => ({
      ...row,
      items: items
        .filter((item) => item.contentId === row.id)
        .map((item) => ({
          ...item,
          meta: item.metaJson ? JSON.parse(item.metaJson) : null,
        })),
    }));

    return paginated(data, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:content:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const body = await parseBody(req, createPublicContentSchema);
    const [result] = await db.insert(publicContent).values({
      pageKey: body.pageKey,
      sectionKey: body.sectionKey,
      type: body.type,
      title: body.title ?? null,
      subtitle: body.subtitle ?? null,
      body: body.body ?? null,
      imageUrl: body.imageUrl ?? null,
      linkLabel: body.linkLabel ?? null,
      linkUrl: body.linkUrl ?? null,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    });

    if (body.items.length > 0) {
      await db.insert(publicContentItems).values(
        body.items.map((item, index) => ({
          contentId: result.insertId,
          label: item.label ?? null,
          title: item.title ?? null,
          value: item.value ?? null,
          body: item.body ?? null,
          url: item.url ?? null,
          fileUrl: item.fileUrl ?? null,
          imageUrl: item.imageUrl ?? null,
          metaJson: item.meta ? JSON.stringify(item.meta) : null,
          sortOrder: item.sortOrder ?? index,
        })),
      );
    }

    const [row] = await db.select().from(publicContent).where(eq(publicContent.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
