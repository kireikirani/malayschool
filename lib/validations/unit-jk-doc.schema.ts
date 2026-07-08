import { z } from "zod";
import { optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

export const createUnitJkDocSchema = z.object({
  unitSlug: trimmedString(1, 50),
  jkCode: trimmedString(1, 100),
  label: trimmedString(1, 200),
  fileUrl: z.string().trim().min(1).max(2000),
  fileType: z.enum(["pdf", "image", "doc", "link"]).default("pdf"),
  tahun: optionalTrimmedString(10),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const updateUnitJkDocSchema = createUnitJkDocSchema.partial();

export const unitJkDocQuerySchema = paginationSchema.extend({
  unitSlug: z.string().optional(),
  jkCode: z.string().optional(),
});
