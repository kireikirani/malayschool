import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

export const createUnitDokumenSchema = z.object({
  unitSlug: trimmedString(1, 50),
  type: z.enum(["carta-org", "dokumen"]).default("dokumen"),
  label: trimmedString(1, 200),
  fileUrl: imagePathSchema,
  fileType: z.enum(["pdf", "image", "doc"]).default("pdf"),
  tahun: optionalTrimmedString(10),
  isVisible: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const updateUnitDokumenSchema = createUnitDokumenSchema.partial();

export const unitDokumenQuerySchema = paginationSchema.extend({
  unitSlug: z.string().optional(),
  type: z.enum(["carta-org", "dokumen"]).optional(),
});
