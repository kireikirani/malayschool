import { z } from "zod";
import { paginationSchema } from "./common.schema";

export const mediaQuerySchema = paginationSchema.extend({
  folder: z.enum(["general", "documents"]).optional(),
  category: z.enum(["spreadsheet", "pdf", "document"]).optional(),
});

export const createMediaSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  filePath: z.string().trim().url().max(2048),
  fileKey: z.string().trim().min(1).max(255),
  fileType: z.string().trim().min(1).max(100).optional().nullable(),
  fileSize: z.number().int().positive().optional().nullable(),
  folder: z.enum(["general", "documents"]).optional(),
});

export const presignMediaSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileType: z.string().trim().min(1).max(100),
  fileSize: z.number().int().positive(),
  folder: z.enum(["general", "documents"]),
});
