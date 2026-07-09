import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teachers } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { ok, fail } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { getSession } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";
import { optionalTrimmedString, trimmedString, imagePathSchema } from "@/lib/validations/common.schema";

const teacherSelfUpdateSchema = z.object({
  name: trimmedString(1, 255),
  position: optionalTrimmedString(255),
  photo: imagePathSchema.or(z.literal("")).optional().nullable(),
  biography: optionalTrimmedString(5000),
  phone: optionalTrimmedString(50),
  subject: optionalTrimmedString(255),
  notes: optionalTrimmedString(5000),
});

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || session.user.role !== "teacher") {
      throw new ApiError("Unauthorized", 401);
    }

    const userId = session.user.id;

    // Check if record exists in teachers table
    let [row] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, userId))
      .limit(1);

    // If not, automatically initialize/create one
    if (!row) {
      const id = crypto.randomUUID();
      // Safe casting since user can have additional fields
      const userObj = session.user as any;
      await db.insert(teachers).values({
        id,
        userId,
        name: userObj.name,
        phone: userObj.teacherPhone ?? null,
        subject: userObj.teacherSubject ?? null,
        notes: userObj.teacherNotes ?? null,
        status: "active",
        sortOrder: 0,
      });

      [row] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.userId, userId))
        .limit(1);
    }

    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || session.user.role !== "teacher") {
      throw new ApiError("Unauthorized", 401);
    }

    if (!rateLimit(`${getClientIp(req)}:teacher-self-service:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, teacherSelfUpdateSchema);
    const userId = session.user.id;

    // Verify record exists
    let [row] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, userId))
      .limit(1);

    if (!row) {
      // If it doesn't exist, we can initialize it now before updating
      const id = crypto.randomUUID();
      const userObj = session.user as any;
      await db.insert(teachers).values({
        id,
        userId,
        name: body.name || userObj.name,
        position: body.position ?? null,
        photo: body.photo ?? null,
        biography: body.biography ?? null,
        phone: body.phone ?? userObj.teacherPhone ?? null,
        subject: body.subject ?? userObj.teacherSubject ?? null,
        notes: body.notes ?? userObj.teacherNotes ?? null,
        status: "active",
        sortOrder: 0,
      });
    } else {
      // Update existing record
      await db
        .update(teachers)
        .set({
          name: body.name,
          position: body.position ?? null,
          photo: body.photo ?? null,
          biography: body.biography ?? null,
          phone: body.phone ?? null,
          subject: body.subject ?? null,
          notes: body.notes ?? null,
        })
        .where(eq(teachers.userId, userId));
    }

    // Fetch updated row
    const [updatedRow] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.userId, userId))
      .limit(1);

    return ok(updatedRow);
  } catch (err) {
    return handleApiError(err);
  }
}
