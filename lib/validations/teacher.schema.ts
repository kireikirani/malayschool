import { z } from "zod";
import { paginationSchema } from "./common.schema";

const teacherFields = z.object({
  name: z.string().trim().min(1).max(255),
  position: z.string().max(255).optional(),
  photo: z.string().url().max(2048).optional(),
  biography: z.string().optional(),
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
