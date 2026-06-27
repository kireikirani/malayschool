import { z } from "zod";
import { httpUrlSchema, imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

export const createAdvertisementSchema = z
  .object({
    name: trimmedString(1, 255),
    type: z.enum(["adsense_code", "html_script", "banner_image", "external_link"]),
    placement: z.enum(["homepage_top", "homepage_sidebar", "news_detail", "footer"]),
    content: z.string().trim().min(1),
    status: z.enum(["active", "inactive"]).default("inactive"),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "external_link") {
      const result = httpUrlSchema.safeParse(data.content);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content"],
          message: "External link must be a valid http/https URL",
        });
      }
    }

    if (data.type === "banner_image") {
      const result = imagePathSchema.safeParse(data.content);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["content"],
          message: "Banner image must be a valid image URL or root-relative path",
        });
      }
    }
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const updateAdvertisementSchema = z
  .object({
    name: optionalTrimmedString(255),
    type: z.enum(["adsense_code", "html_script", "banner_image", "external_link"]).optional(),
    placement: z.enum(["homepage_top", "homepage_sidebar", "news_detail", "footer"]).optional(),
    content: optionalTrimmedString(20000),
    status: z.enum(["active", "inactive"]).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const advertisementQuerySchema = paginationSchema.extend({
  placement: z.enum(["homepage_top", "homepage_sidebar", "news_detail", "footer"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
