import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { publicContent } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { reorderSectionsSchema } from "@/lib/validations/content.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:content:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const body = await parseBody(req, reorderSectionsSchema);
    await Promise.all(
      body.map((row) =>
        db.update(publicContent).set({ sortOrder: row.sortOrder }).where(eq(publicContent.id, row.id)),
      ),
    );
    return ok({ updated: body.length });
  } catch (err) {
    return handleApiError(err);
  }
}
