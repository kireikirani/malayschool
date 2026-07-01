import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// Validate settings payload: flat object where every key and value must be a non-empty string.
const settingsSchema = z
  .record(z.string().min(1).max(100), z.string().min(1).max(5000))
  .refine((obj) => Object.keys(obj).length > 0, { message: "At least one setting must be provided" });

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
    const rows = await db.select().from(siteSettings);
    const result: Record<string, string> = {};
    for (const row of rows) result[row.key] = row.value;
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:settings:write`, 10, 60_000)) {
      return fail("Too many requests", 429);
    }

    const raw = await req.json();
    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) {
      return fail("Validation failed", 400);
    }

    const entries = Object.entries(parsed.data);
    for (const [key, value] of entries) {
      await db
        .insert(siteSettings)
        .values({ key, value })
        .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
    }

    return ok({ updated: entries.length });
  } catch (err) {
    return handleApiError(err);
  }
}
