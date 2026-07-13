import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";

export const trimmedString = (min = 1, max = 255) => z.string().trim().min(min).max(max);

export const optionalTrimmedString = (max = 255) =>
  z.preprocess(
    (value) => {
      if (value == null) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().max(max).optional(),
  );

export const httpUrlSchema = z.string().trim().url().refine((value) => /^https?:\/\//.test(value), {
  message: "Invalid URL",
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  q: z.string().trim().min(1).optional(),
});

// Accepts either a full URL (UploadThing, external) or a root-relative path
// (locally hosted assets under /public, e.g. seeded photos) — image fields
// must keep working when an admin resaves a record without re-uploading.
export const imagePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => /^https?:\/\//.test(value) || value.startsWith("/"), {
    message: "Invalid URL",
  });

// Optional variant that treats empty string / null as "not provided" — needed
// because admin forms initialise upload fields to "" instead of leaving them
// undefined, which would otherwise fail imagePathSchema's min(1) refinement.
export const optionalImagePath = z.preprocess(
  (value) => {
    if (value == null) return undefined;
    if (typeof value === "string" && value.trim() === "") return undefined;
    return value;
  },
  imagePathSchema.optional(),
);

export const richTextContentSchema = z.string().trim().min(1).superRefine((value, ctx) => {
  const textOnly = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (textOnly.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Content is required",
    });
  }
});

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
