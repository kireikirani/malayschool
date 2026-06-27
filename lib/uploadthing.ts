import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ALLOWED_DOCUMENT_MIME_TYPES, ALLOWED_IMAGE_MIME_TYPES } from "@/lib/constants";

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
  documentUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 10 },
    text: { maxFileSize: "2MB", maxFileCount: 10 },
    "text/csv": { maxFileSize: "4MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "8MB", maxFileCount: 10 },
    "application/vnd.ms-excel": { maxFileSize: "8MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "8MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "8MB", maxFileCount: 10 },
    "application/vnd.ms-powerpoint": { maxFileSize: "8MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { maxFileSize: "8MB", maxFileCount: 10 },
    "application/rtf": { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session || session.user.role !== "admin") {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
        throw new UploadThingError("Unsupported file type");
      }

      await db.insert(media).values({
        id: crypto.randomUUID(),
        fileName: file.name,
        filePath: file.ufsUrl,
        fileKey: file.key,
        fileType: file.type,
        fileSize: file.size,
        folder: "documents",
        uploadedBy: metadata.userId,
      });
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
