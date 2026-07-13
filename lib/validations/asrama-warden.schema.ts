import { z } from "zod";
import { paginationSchema, trimmedString } from "./common.schema";

const wardenFields = z.object({
  teacherId: trimmedString(1, 36),
  jawatan: trimmedString(1, 200),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createAsramaWardenSchema = wardenFields;
export const updateAsramaWardenSchema = wardenFields.partial();
export const asramaWardenQuerySchema = paginationSchema;
