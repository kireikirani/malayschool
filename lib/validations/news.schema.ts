import { z } from "zod";
import { paginationSchema } from "./common.schema";

const newsFields = z.object({
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255).optional(),
  content: z.string().min(1),
  thumbnail: z.string().url().max(2048).optional(),
  status: z.enum(["draft", "published"]),
  publishDate: z.coerce.date().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
  ogImage: z.string().url().max(2048).optional(),
});

export const createNewsSchema = newsFields.extend({
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateNewsSchema = newsFields.partial();

export const newsQuerySchema = paginationSchema.extend({
  status: z.enum(["draft", "published"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
