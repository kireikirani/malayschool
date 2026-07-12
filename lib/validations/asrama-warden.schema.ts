import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const wardenFields = z.object({
  nama: trimmedString(1, 200),
  jawatan: trimmedString(1, 200),
  telefon: optionalTrimmedString(50),
  foto: imagePathSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createAsramaWardenSchema = z.object({
  teacherId: z.string().min(1, "Sila pilih guru/staff").max(36),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const updateAsramaWardenSchema = z.object({
  teacherId: z.string().min(1).max(36).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  nama: wardenFields.shape.nama.optional(),
  jawatan: wardenFields.shape.jawatan.optional(),
  telefon: wardenFields.shape.telefon,
  foto: wardenFields.shape.foto,
});

export const asramaWardenQuerySchema = paginationSchema;
