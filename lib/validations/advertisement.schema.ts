import { z } from "zod";
import { paginationSchema } from "./common.schema";

export const createAdvertisementSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    type: z.enum(["adsense_code", "html_script", "banner_image", "external_link"]),
    placement: z.enum(["homepage_top", "homepage_sidebar", "news_detail", "footer"]),
    content: z.string().min(1),
    status: z.enum(["active", "inactive"]).default("inactive"),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const updateAdvertisementSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    type: z.enum(["adsense_code", "html_script", "banner_image", "external_link"]).optional(),
    placement: z.enum(["homepage_top", "homepage_sidebar", "news_detail", "footer"]).optional(),
    content: z.string().min(1).optional(),
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
