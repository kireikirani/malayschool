import { z } from "zod";
import { paginationSchema, trimmedString } from "./common.schema";

export const ALLOWED_FASILITI_ICONS = [
  "BedDouble", "Utensils", "BookOpen", "Landmark", "Trophy", "Shirt",
  "Wifi", "ShieldCheck", "Dumbbell", "Camera", "Home", "Users",
  "Star", "Droplets", "Wind", "Zap", "Monitor", "Heart",
] as const;

const fasilitiFields = z.object({
  iconName: z.enum(ALLOWED_FASILITI_ICONS),
  label: trimmedString(1, 200),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createAsramaFasilitiSchema = fasilitiFields;
export const updateAsramaFasilitiSchema = fasilitiFields.partial();
export const asramaFasilitiQuerySchema = paginationSchema;
