import { and, count, desc, eq, like } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { paginated } from "@/lib/api/response";
import { parseQuery } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { mediaQuerySchema } from "@/lib/validations/media.schema";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const { page, limit, q, folder } = parseQuery(new URL(req.url).searchParams, mediaQuerySchema);

    const conditions = [];
    if (folder) conditions.push(eq(media.folder, folder));
    if (q) conditions.push(like(media.fileName, `%${q}%`));
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
