import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2Config } from "@/lib/r2";
import { requireAdmin } from "@/lib/api/with-auth";
import { handleApiError } from "@/lib/api/error-handler";
import { fail, ok } from "@/lib/api/response";
import { ALLOWED_DOCUMENT_MIME_TYPES, ALLOWED_IMAGE_MIME_TYPES } from "@/lib/constants";
import { parseBody } from "@/lib/api/validate-request";
import { presignMediaSchema } from "@/lib/validations/media.schema";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const body = await parseBody(req, presignMediaSchema);
    const { fileName, fileType, fileSize, folder } = body;

    if (folder === "general") {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(fileType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        return fail("Unsupported image file type", 400);
      }
      if (fileSize > 4 * 1024 * 1024) {
        return fail("Image size exceeds maximum limit of 4MB", 400);
      }
    } else if (folder === "documents") {
      if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(fileType as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
        return fail("Unsupported document file type", 400);
      }
      if (fileSize > 8 * 1024 * 1024) {
        return fail("Document size exceeds maximum limit of 8MB", 400);
      }
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `${folder}/${crypto.randomUUID()}-${sanitizedName}`;
    const r2 = getR2Config();
    const publicUrl = `${r2.publicUrl}/${fileKey}`;

    const command = new PutObjectCommand({
      Bucket: r2.bucketName,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 3600 });

    return ok({
      uploadUrl,
      fileKey,
      publicUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
