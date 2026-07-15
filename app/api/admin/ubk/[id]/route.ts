import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ubkLinks } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { noContent, notFound, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { z } from "zod";
import { trimmedString, optionalTrimmedString } from "@/lib/validations/common.schema";

const updateUbkLinkSchema = z.object({
  tingkatan: trimmedString(1, 50).optional(),
  label: optionalTrimmedString(200),
  sheetUrl: z.string().trim().url().refine((v) => v.includes("docs.google.com/spreadsheets"), {
    message: "URL mesti dari Google Sheets",
  }).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const numId = Number(id);
    const body = await parseBody(req, updateUbkLinkSchema);

    const [existing] = await db.select({ id: ubkLinks.id }).from(ubkLinks).where(eq(ubkLinks.id, numId)).limit(1);
    if (!existing) return notFound("Link tidak ditemui");

    await db.update(ubkLinks).set({ ...body, updatedAt: new Date() }).where(eq(ubkLinks.id, numId));
    const [row] = await db.select().from(ubkLinks).where(eq(ubkLinks.id, numId)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const numId = Number(id);
    const [existing] = await db.select({ id: ubkLinks.id }).from(ubkLinks).where(eq(ubkLinks.id, numId)).limit(1);
    if (!existing) throw new ApiError("Link tidak ditemui", 404);
    await db.delete(ubkLinks).where(eq(ubkLinks.id, numId));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
