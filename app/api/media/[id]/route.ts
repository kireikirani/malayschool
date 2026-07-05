import { eq } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2Config } from "@/lib/r2";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, noContent, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (!row) return fail("Not found", 404);
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:media:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (!row) return fail("Not found", 404);

    await db.delete(media).where(eq(media.id, id));

    try {
      const r2 = getR2Config();
      await getR2Client().send(
        new DeleteObjectCommand({
          Bucket: r2.bucketName,
          Key: row.fileKey,
        }),
      );
    } catch (err) {
      console.error("Failed to delete remote file from Cloudflare R2:", err);
    }

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
