import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ALLOWED_IMAGE_MIME_TYPES } from "@/lib/constants";

const f = createUploadthing();

export const fileRouter = {
  mediaUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session || session.user.role !== "admin") {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        throw new UploadThingError("Unsupported file type");
      }

      await db.insert(media).values({
        id: crypto.randomUUID(),
        fileName: file.name,
        filePath: file.ufsUrl,
        fileKey: file.key,
        fileType: file.type,
        fileSize: file.size,
        folder: "general",
        uploadedBy: metadata.userId,
      });
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
