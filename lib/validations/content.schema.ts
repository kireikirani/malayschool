import { z } from "zod";
import { optionalImagePath, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

export const sectionTypeSchema = z.enum([
  "hero",
  "text_block",
  "stats",
  "poster",
  "file_list",
  "quick_links",
  "simple_table",
  "card_grid",
  "gallery",
  "jk_table",
]);

export const contentItemSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  label: optionalTrimmedString(255),
  title: optionalTrimmedString(255),
  value: optionalTrimmedString(255),
  body: optionalTrimmedString(5000),
  url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  fileUrl: optionalImagePath,
  imageUrl: optionalImagePath,
  meta: z.preprocess((v) => (v == null ? undefined : v), z.record(z.string(), z.unknown()).optional()),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const createPublicContentSchema = z.object({
  pageKey: trimmedString(1, 50),
  sectionKey: trimmedString(1, 100),
  type: sectionTypeSchema,
  title: optionalTrimmedString(255),
  subtitle: optionalTrimmedString(5000),
  body: optionalTrimmedString(5000),
  imageUrl: optionalImagePath,
  linkLabel: optionalTrimmedString(255),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  items: z.array(contentItemSchema).default([]),
});

export const updatePublicContentSchema = createPublicContentSchema.partial();

export const publicContentQuerySchema = paginationSchema.extend({
  pageKey: z.string().trim().optional(),
});

export const createUnitSectionSchema = z.object({
  unitSlug: trimmedString(1, 50),
  sectionKey: trimmedString(1, 100),
  type: sectionTypeSchema,
  title: optionalTrimmedString(255),
  subtitle: optionalTrimmedString(5000),
  body: optionalTrimmedString(5000),
  imageUrl: optionalImagePath,
  linkLabel: optionalTrimmedString(255),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  items: z.array(contentItemSchema).default([]),
});

export const updateUnitSectionSchema = createUnitSectionSchema.partial();

export const unitSectionsQuerySchema = paginationSchema.extend({
  limit: z.coerce.number().int().min(1).max(500).default(20),
  unitSlug: z.string().trim().optional(),
});

export const reorderSectionsSchema = z.array(
  z.object({
    id: z.coerce.number().int().positive(),
    sortOrder: z.coerce.number().int().min(0),
  }),
);
