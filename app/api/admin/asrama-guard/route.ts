import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, asramaGuards } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { created, fail, paginated } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { requireAdmin } from "@/lib/api/with-auth";
import { createAsramaGuardSchema } from "@/lib/validations/asrama-guard.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? "20"));

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: asramaGuards.id,
          userId: asramaGuards.userId,
          nama: asramaGuards.nama,
          noTelefon: asramaGuards.noTelefon,
          status: asramaGuards.status,
          email: user.email,
          createdAt: asramaGuards.createdAt,
        })
        .from(asramaGuards)
        .leftJoin(user, eq(asramaGuards.userId, user.id))
        .orderBy(asramaGuards.id)
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(asramaGuards),
    ]);

    return paginated(rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:asrama-guard:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const body = await parseBody(req, createAsramaGuardsBodySchema());
    
    // 1. Create user account using better-auth api
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.nama,
      },
    });

    if (!signUpResult || !signUpResult.user) {
      throw new ApiError("Gagal mencipta akaun pengawal", 500);
    }

    // 2. Update user role to "guard" and set approved
    await db
      .update(user)
      .set({ role: "guard", isApproved: true })
      .where(eq(user.id, signUpResult.user.id));

    // 3. Create asrama_guards row
    const [result] = await db.insert(asramaGuards).values({
      userId: signUpResult.user.id,
      nama: body.nama,
      noTelefon: body.noTelefon || null,
      status: "active",
    });

    const [row] = await db.select().from(asramaGuards).where(eq(asramaGuards.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}

// Helper to avoid circular/direct imports that typescript might complain about during parseBody
function createAsramaGuardsBodySchema() {
  return createAsramaGuardSchema;
}
