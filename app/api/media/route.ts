import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok, paginated } from "@/lib/api/response";
import { parseBody, parseQuery } from "@/lib/api/validate-request";
import { requireAdmin, requireAdminOrTeacher } from "@/lib/api/with-auth";
import { createMediaSchema, mediaQuerySchema } from "@/lib/validations/media.schema";

export async function GET(req: Request) {
  try {
    const session = await requireAdminOrTeacher(req);

    const { page, limit, q, folder, category } = parseQuery(new URL(req.url).searchParams, mediaQuerySchema);

    if (session.user.role === "teacher" && folder !== "general") {
      return fail("Forbidden", 403);
    }

    const conditions = [];
    if (folder) conditions.push(eq(media.folder, folder));
    if (q) conditions.push(sql`LOWER(${media.fileName}) LIKE ${`%${q.toLowerCase()}%`}`);
    if (category === "spreadsheet") {
      conditions.push(
        or(like(media.fileName, "%.xlsx"), like(media.fileName, "%.xls"), like(media.fileName, "%.csv")),
      );
    }
    if (category === "pdf") {
      conditions.push(like(media.fileName, "%.pdf"));
    }
    if (category === "document") {
      conditions.push(
        or(
          like(media.fileName, "%.doc"),
          like(media.fileName, "%.docx"),
          like(media.fileName, "%.ppt"),
          like(media.fileName, "%.pptx"),
          like(media.fileName, "%.txt"),
          like(media.fileName, "%.rtf"),
        ),
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(media).where(where).orderBy(desc(media.uploadedAt)).limit(limit).offset((page - 1) * limit),
      db.select({ total: count() }).from(media).where(where),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminOrTeacher(req);

    const body = await parseBody(req, createMediaSchema);
    const { fileName, filePath, fileKey, fileType, fileSize, folder } = body;

    if (session.user.role === "teacher" && (folder ?? "general") !== "general") {
      return fail("Forbidden", 403);
    }

    const newId = crypto.randomUUID();
    const item = {
      id: newId,
      fileName,
      filePath,
      fileKey,
      fileType: fileType || null,
      fileSize: fileSize || null,
      folder: folder || "general",
      uploadedBy: session.user.id,
    };

    await db.insert(media).values(item);

    return ok({ ...item, uploadedAt: new Date().toISOString() });
  } catch (err) {
    return handleApiError(err);
  }
}
