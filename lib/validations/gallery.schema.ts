import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

export const createAlbumSchema = z.object({
  name: trimmedString(1, 255),
  description: optionalTrimmedString(2000),
  coverImage: imagePathSchema.optional(),
});

export const updateAlbumSchema = createAlbumSchema.partial();

export const albumQuerySchema = paginationSchema;

export const galleryItemSchema = z.object({
  image: imagePathSchema,
  caption: optionalTrimmedString(500),
});

export const createGalleryItemsSchema = z
  .array(galleryItemSchema)
  .min(1)
  .superRefine((items, ctx) => {
    const seen = new Set<string>();
    for (const [index, item] of items.entries()) {
      if (seen.has(item.image)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "image"],
          message: "Duplicate image in upload batch",
        });
      }
      seen.add(item.image);
    }
  });

export const updateGalleryItemSchema = z.object({
  caption: optionalTrimmedString(500),
});

export const reorderItemsSchema = z
  .array(
    z.object({
      itemId: z.string().min(1),
      order: z.coerce.number().int().min(0),
    }),
  )
  .min(1);
  
export const strictReorderItemsSchema = reorderItemsSchema.superRefine((items, ctx) => {
  const itemIds = new Set<string>();
  const orders = new Set<number>();

  for (const [index, item] of items.entries()) {
    if (itemIds.has(item.itemId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, "itemId"],
        message: "Duplicate itemId in reorder payload",
      });
    }
    if (orders.has(item.order)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, "order"],
        message: "Duplicate order in reorder payload",
      });
    }
    itemIds.add(item.itemId);
    orders.add(item.order);
  }
});
