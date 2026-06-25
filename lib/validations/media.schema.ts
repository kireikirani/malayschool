import { z } from "zod";
import { paginationSchema } from "./common.schema";

export const mediaQuerySchema = paginationSchema.extend({
  folder: z.string().trim().min(1).optional(),
});
