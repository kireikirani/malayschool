import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/r2";
import { requireAdmin } from "@/lib/api/with-auth";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { ALLOWED_DOCUMENT_MIME_TYPES, ALLOWED_IMAGE_MIME_TYPES } from "@/lib/constants";
import { parseBody } from "@/lib/api/validate-request";
import { presignMediaSchema } from "@/lib/validations/media.schema";

export async function POST(req: Request) {
  try {
    // 1. Ensure the user is an admin
    const session = await requireAdmin(req);

    // 2. Parse request body and validate
    const body = await parseBody(req, presignMediaSchema);
    const { fileName, fileType, fileSize, folder } = body;

    // 3. Validate file types and size constraints
    if (folder === "general") {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(fileType as any)) {
        return fail("Unsupported image file type", 400);
      }
      if (fileSize > 4 * 1024 * 1024) {
        return fail("Image size exceeds maximum limit of 4MB", 400);
      }
    } else if (folder === "documents") {
      if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(fileType as any)) {
        return fail("Unsupported document file type", 400);
      }
      if (fileSize > 8 * 1024 * 1024) {
        return fail("Document size exceeds maximum limit of 8MB", 400);
      }
    }

    // 4. Generate unique key and public URL
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${folder}/${crypto.randomUUID()}-${sanitizedName}`;
    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "") || "";
    const publicUrl = `${r2PublicUrl}/${fileKey}`;

    // 5. Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "dummy-bucket",
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return ok({
      uploadUrl,
      fileKey,
      publicUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
