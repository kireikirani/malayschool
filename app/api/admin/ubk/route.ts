import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ubkLinks } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { created, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { z } from "zod";
import { trimmedString, optionalTrimmedString } from "@/lib/validations/common.schema";

const createUbkLinkSchema = z.object({
  tingkatan: trimmedString(1, 50),
  label: optionalTrimmedString(200),
  sheetUrl: z.string().trim().url().refine((v) => v.includes("docs.google.com/spreadsheets"), {
    message: "URL mesti dari Google Sheets",
  }),
});

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const rows = await db.select().from(ubkLinks).orderBy(asc(ubkLinks.tingkatan), asc(ubkLinks.id));
    return ok({ rows, total: rows.length });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await parseBody(req, createUbkLinkSchema);
    const [result] = await db.insert(ubkLinks).values(body);
    const [row] = await db.select().from(ubkLinks).where(eq(ubkLinks.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
