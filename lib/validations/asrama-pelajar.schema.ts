import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const asramaPelajarFields = z.object({
  jantina: z.enum(["lelaki", "perempuan"]),
  nama: trimmedString(1, 200),
  tingkatan: trimmedString(1, 10),
  dorm: trimmedString(1, 100),
  namaWaris: optionalTrimmedString(200),
  noWaris: optionalTrimmedString(20),
  namaWaris2: optionalTrimmedString(200),
  noWaris2: optionalTrimmedString(20),
  namaWaris3: optionalTrimmedString(200),
  noWaris3: optionalTrimmedString(20),
  foto: imagePathSchema.optional(),
  gdriveFolderLink: optionalTrimmedString(2048),
  status: z.enum(["active", "inactive"]),
});

export const createAsramaPelajarSchema = asramaPelajarFields.extend({
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateAsramaPelajarSchema = asramaPelajarFields.partial();

export const asramaPelajarQuerySchema = paginationSchema.extend({
  jantina: z.enum(["lelaki", "perempuan"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  tingkatan: z.string().optional(),
  dorm: z.string().optional(),
});
