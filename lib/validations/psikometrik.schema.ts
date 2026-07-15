import { z } from "zod";
import { paginationSchema } from "./common.schema";
import { sanitizeCell, sanitizeScores, normalizeIc } from "@/lib/sanitize";

const safeString = (min: number, max: number) =>
  z.string().transform((v) => sanitizeCell(v)).pipe(z.string().trim().min(min).max(max));

const safeOptionalString = (max: number) =>
  z.preprocess((v) => {
    if (v == null) return undefined;
    if (typeof v !== "string") return v;
    const clean = sanitizeCell(v);
    return clean === "" ? undefined : clean;
  }, z.string().max(max).optional());

const safeScores = z
  .record(z.string(), z.coerce.number())
  .transform((raw) => sanitizeScores(raw))
  .pipe(z.record(z.string().min(1), z.number()).refine((v) => Object.keys(v).length <= 50, {
    message: "Terlalu banyak tret (maksimum 50)",
  }));

export const psikometrikFields = z.object({
  noPengenalan: z.string().transform((v) => normalizeIc(sanitizeCell(v))).pipe(z.string().min(6).max(20)),
  namaMurid: safeString(1, 200),
  kodSekolah: safeOptionalString(20),
  namaSekolah: safeOptionalString(200),
  namaKelas: safeOptionalString(50),
  tarikh: safeOptionalString(30),
  scores: safeScores,
});

export const createPsikometrikSchema = psikometrikFields;
export const updatePsikometrikSchema = psikometrikFields.partial();

export const psikometrikQuerySchema = paginationSchema.extend({
  namaKelas: z.string().optional(),
});

export const psikometrikImportSchema = z.object({
  rows: z.array(psikometrikFields).min(1).max(2000),
});
