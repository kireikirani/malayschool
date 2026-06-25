import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { news } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    if (!row) return fail("Not found", 404);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}
