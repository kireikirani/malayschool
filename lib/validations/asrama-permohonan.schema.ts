import { z } from "zod";

export const createPermohonanSchema = z.object({
  nama: z.string().min(3, "Nama pelajar mestilah sekurang-kurangnya 3 aksara"),
  noWaris: z.string().min(5, "Nombor telefon waris tidak sah"),
  emailWaris: z.string().email("Format email tidak sah").min(1, "Email waris diperlukan"),
  jenis: z.enum(["pulang_bermalam", "outing", "mc_sakit"]),
  tarikhKeluar: z.string().min(1, "Tarikh keluar diperlukan"),
  tarikhPulang: z.string().optional().nullable(),
  sebab: z.string().min(5, "Sila berikan sebab yang munasabah (min 5 aksara)"),
}).refine(data => {
  if (data.jenis === "pulang_bermalam" && !data.tarikhPulang) {
    return false;
  }
  return true;
}, {
  message: "Tarikh pulang diperlukan untuk permohonan pulang bermalam",
  path: ["tarikhPulang"]
});

export const approvePermohonanSchema = z.object({
  status: z.enum(["diluluskan", "ditolak", "mc"]),
  catatan: z.string().optional().nullable(),
});

export const checkoutSchema = z.object({
  pengambil: z.string().min(3, "Nama pengambil mestilah sekurang-kurangnya 3 aksara"),
  noPendaftaran: z.string().min(3, "Nombor pendaftaran kenderaan diperlukan"),
});

export const mcSchema = z.object({
  pelajarId: z.coerce.number().int().positive("Pelajar diperlukan"),
  tarikhKeluar: z.string().min(1, "Tarikh mula sakit diperlukan"),
  sebab: z.string().min(3, "Sebab sakit diperlukan"),
});

export const permohonanQuerySchema = z.object({
  status: z.enum(["menunggu", "diluluskan", "ditolak", "mc"]).optional(),
  jenis: z.enum(["pulang_bermalam", "outing", "mc_sakit"]).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(20),
});
