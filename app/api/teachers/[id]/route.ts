import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { ok, fail, noContent } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin, getSession } from "@/lib/api/with-auth";
import { updateTeacherSchema } from "@/lib/validations/teacher.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    if (!row) return fail("Not found", 404);

    if (row.status !== "active") {
      const session = await getSession(req);
      if (session?.user.role !== "admin") return fail("Not found", 404);
    }

    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:teachers:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, updateTeacherSchema);

    const [existing] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.id, id)).limit(1);
    if (!existing) return fail("Not found", 404);

    await db.update(teachers).set(body).where(eq(teachers.id, id));
    const [row] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:teachers:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const [existing] = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.id, id)).limit(1);
    if (!existing) throw new ApiError("Not found", 404);

    await db.delete(teachers).where(eq(teachers.id, id));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
