import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:advertisements:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;

    const [existing] = await db
      .select({ status: advertisements.status })
      .from(advertisements)
      .where(eq(advertisements.id, id))
      .limit(1);
    if (!existing) return fail("Not found", 404);

    const nextStatus = existing.status === "active" ? "inactive" : "active";
    await db.update(advertisements).set({ status: nextStatus }).where(eq(advertisements.id, id));

    const [row] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}
