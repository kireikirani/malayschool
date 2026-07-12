import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const teacherFields = z.object({
  name: trimmedString(1, 255),
  position: optionalTrimmedString(255),
  photo: imagePathSchema.optional(),
  biography: optionalTrimmedString(5000),
  phone: optionalTrimmedString(50),
  subject: optionalTrimmedString(255),
  notes: optionalTrimmedString(5000),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  status: z.enum(["active", "inactive"]),
});

export const createTeacherSchema = teacherFields.extend({
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateTeacherSchema = teacherFields.partial();

export const teacherQuerySchema = paginationSchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
});
