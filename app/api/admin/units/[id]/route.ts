import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unitSectionItems, unitSections } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { updateUnitSectionSchema } from "@/lib/validations/content.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const sectionId = Number(id);
    const [row] = await db.select().from(unitSections).where(eq(unitSections.id, sectionId)).limit(1);
    if (!row) return notFound();

    const items = await db.select().from(unitSectionItems).where(eq(unitSectionItems.sectionId, sectionId));
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
    if (!rateLimit(`${getClientIp(req)}:units:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const sectionId = Number(id);
    const body = await parseBody(req, updateUnitSectionSchema);

    await db
      .update(unitSections)
      .set({
        unitSlug: body.unitSlug,
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
      .where(eq(unitSections.id, sectionId));

    if (body.items) {
      await db.delete(unitSectionItems).where(eq(unitSectionItems.sectionId, sectionId));
      if (body.items.length > 0) {
        await db.insert(unitSectionItems).values(
          body.items.map((item, index) => ({
            sectionId,
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

    const [row] = await db.select().from(unitSections).where(eq(unitSections.id, sectionId)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:units:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const sectionId = Number(id);
    await db.delete(unitSectionItems).where(eq(unitSectionItems.sectionId, sectionId));
    await db.delete(unitSections).where(eq(unitSections.id, sectionId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
