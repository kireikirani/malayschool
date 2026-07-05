import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const wardenFields = z.object({
  nama: trimmedString(1, 200),
  jawatan: trimmedString(1, 200),
  telefon: optionalTrimmedString(50),
  foto: imagePathSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createAsramaWardenSchema = wardenFields;
export const updateAsramaWardenSchema = wardenFields.partial();
export const asramaWardenQuerySchema = paginationSchema;
