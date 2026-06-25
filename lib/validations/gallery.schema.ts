import { z } from "zod";
import { paginationSchema } from "./common.schema";

export const createAlbumSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().optional(),
  coverImage: z.string().url().max(2048).optional(),
});

export const updateAlbumSchema = createAlbumSchema.partial();

export const albumQuerySchema = paginationSchema;

export const galleryItemSchema = z.object({
  image: z.string().url().max(2048),
  caption: z.string().max(500).optional(),
});

export const createGalleryItemsSchema = z.array(galleryItemSchema).min(1);

export const updateGalleryItemSchema = z.object({
  caption: z.string().max(500).optional(),
});

export const reorderItemsSchema = z
  .array(
    z.object({
      itemId: z.string().min(1),
      order: z.coerce.number().int().min(0),
    }),
  )
  .min(1);
