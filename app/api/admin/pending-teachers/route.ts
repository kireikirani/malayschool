import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, teachers } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    // Get all unapproved teacher registration requests
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        teacherPhone: user.teacherPhone,
        teacherSubject: user.teacherSubject,
        teacherNotes: user.teacherNotes,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(
        and(
          eq(user.role, "teacher"),
          eq(user.isApproved, false),
          isNull(user.rejectionReason)
        )
      )
      .orderBy(desc(user.createdAt));

    return ok(rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { userId, action, rejectionReason, position } = body;

    if (!userId || !action) {
      throw new ApiError("userId and action are required", 400);
    }

    // Find the user request
    const [targetUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!targetUser) {
      return fail("Pengguna tidak dijumpai", 404);
    }

    if (targetUser.role !== "teacher") {
      return fail("Pengguna bukan berstatus guru", 400);
    }

    if (targetUser.isApproved) {
      return fail("Akaun guru ini sudah pun diluluskan", 400);
    }

    if (action === "approve") {
      // 1. Update user to approved status
      await db
        .update(user)
        .set({ isApproved: true, rejectionReason: null })
        .where(eq(user.id, userId));

      // 2. Insert into teachers table so they appear in public / directory pages
      const teacherId = crypto.randomUUID();
      await db.insert(teachers).values({
        id: teacherId,
        userId: targetUser.id,
        name: targetUser.name,
        position: position || targetUser.teacherSubject || "Guru",
        phone: targetUser.teacherPhone,
        subject: targetUser.teacherSubject,
        notes: targetUser.teacherNotes,
        status: "active",
      });

      return ok({ message: "Pendaftaran guru diluluskan", teacherId });
    } else if (action === "reject") {
      if (!rejectionReason) {
        throw new ApiError("Sila nyatakan sebab penolakan", 400);
      }

      await db
        .update(user)
        .set({ rejectionReason })
        .where(eq(user.id, userId));

      return ok({ message: "Pendaftaran guru ditolak" });
    } else {
      throw new ApiError("Tindakan tidak sah", 400);
    }
  } catch (err) {
    return handleApiError(err);
  }
}
