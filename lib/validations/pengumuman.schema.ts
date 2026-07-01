import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const pengumumanFields = z.object({
  tajuk: trimmedString(1, 200),
  deskripsi: optionalTrimmedString(2000),
  imageUrl: imagePathSchema,
  linkUrl: z.string().url().optional().or(z.literal("")),
  aktif: z.boolean().default(true),
  tamatPada: z.string().datetime({ offset: true }).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const createPengumumanSchema = pengumumanFields;
export const updatePengumumanSchema = pengumumanFields.partial();

export const pengumumanQuerySchema = paginationSchema.extend({
  aktif: z
    .preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean())
    .optional(),
});
