import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, richTextContentSchema, trimmedString } from "./common.schema";

const newsFields = z.object({
  title: trimmedString(1, 255),
  slug: optionalTrimmedString(255).refine((value) => !value || /^[a-z0-9-]+$/.test(value), {
    message: "Slug may only contain lowercase letters, numbers, and hyphens",
  }),
  content: richTextContentSchema,
  thumbnail: imagePathSchema.optional(),
  status: z.enum(["draft", "published"]),
  publishDate: z.coerce.date().optional(),
  metaTitle: optionalTrimmedString(255),
  metaDescription: optionalTrimmedString(500),
  ogImage: imagePathSchema.optional(),
});

export const createNewsSchema = newsFields
  .extend({
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .superRefine((data, ctx) => {
    if (data.status === "published" && !data.publishDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishDate"],
        message: "Publish date is required when status is published",
      });
    }
  });

export const updateNewsSchema = newsFields.partial();

export const newsQuerySchema = paginationSchema
  .extend({
    status: z.enum(["draft", "published"]).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: "`from` must be before or equal to `to`",
    path: ["to"],
  });
