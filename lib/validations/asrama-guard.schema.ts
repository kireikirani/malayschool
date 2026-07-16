import { z } from "zod";

export const createAsramaGuardSchema = z.object({
  email: z.string().email("Format email tidak sah"),
  password: z.string().min(8, "Kata laluan mestilah sekurang-kurangnya 8 aksara"),
  nama: z.string().min(3, "Nama mestilah sekurang-kurangnya 3 aksara"),
  noTelefon: z.string().optional(),
});

export const updateAsramaGuardSchema = z.object({
  nama: z.string().min(3, "Nama mestilah sekurang-kurangnya 3 aksara"),
  noTelefon: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});
