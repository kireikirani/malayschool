import { z } from "zod";
import { optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const UNIT_SLUGS = ["pentadbiran", "kurikulum", "kokurikulum", "hal-ehwal-murid", "teknologi-maklumat", "bimbingan-kaunseling", "asrama"] as const;

const jkFields = z.object({
  unitSlug: z.enum(UNIT_SLUGS),
  jkCode: trimmedString(1, 20),
  jkTitle: trimmedString(1, 200),
  nama: trimmedString(1, 200),
  jawatan: trimmedString(1, 200),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createUnitJkSchema = jkFields;
export const updateUnitJkSchema = jkFields.partial();
export const unitJkQuerySchema = paginationSchema.extend({
  unitSlug: z.enum(UNIT_SLUGS).optional(),
  jkCode: optionalTrimmedString(20),
});
