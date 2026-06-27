import { z } from "zod";
import { imagePathSchema, optionalTrimmedString, paginationSchema, trimmedString } from "./common.schema";

const teacherFields = z.object({
  name: trimmedString(1, 255),
  position: optionalTrimmedString(255),
  photo: imagePathSchema.optional(),
  biography: optionalTrimmedString(5000),
  status: z.enum(["active", "inactive"]),
});

export const createTeacherSchema = teacherFields.extend({
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateTeacherSchema = teacherFields.partial();

export const teacherQuerySchema = paginationSchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["name", "position"]).default("name"),
});
