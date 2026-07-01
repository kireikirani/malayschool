import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { publicContent, publicContentItems } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updatePublicContentSchema } from "@/lib/validations/content.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const contentId = Number(id);
    const [row] = await db.select().from(publicContent).where(eq(publicContent.id, contentId)).limit(1);
    if (!row) return notFound();

    const items = await db.select().from(publicContentItems).where(eq(publicContentItems.contentId, contentId));
    return ok({
      ...row,
      items: items.map((item) => ({
        ...item,
        meta: item.metaJson ? JSON.parse(item.metaJson) : null,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:content:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const contentId = Number(id);
    const body = await parseBody(req, updatePublicContentSchema);

    await db
      .update(publicContent)
      .set({
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
      })
      .where(eq(publicContent.id, contentId));

    if (body.items) {
      await db.delete(publicContentItems).where(eq(publicContentItems.contentId, contentId));
      if (body.items.length > 0) {
        await db.insert(publicContentItems).values(
          body.items.map((item, index) => ({
            contentId,
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
    }

    const [row] = await db.select().from(publicContent).where(eq(publicContent.id, contentId)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:content:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const contentId = Number(id);
    await db.delete(publicContentItems).where(eq(publicContentItems.contentId, contentId));
    await db.delete(publicContent).where(eq(publicContent.id, contentId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
