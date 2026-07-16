import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPermohonan } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAdmin } from "@/lib/api/with-auth";

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "";
  try {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return dateObj.toISOString().split("T")[0];
  } catch {
    return String(d);
  }
}

function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "";
  try {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    // Format to local date time or readable string
    return dateObj.toISOString().replace("T", " ").substring(0, 19);
  } catch {
    return String(d);
  }
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    // Fetch all permohonan records for export
    const rows = await db
      .select()
      .from(asramaPermohonan)
      .orderBy(desc(asramaPermohonan.createdAt));

    const csvHeaders = [
      "ID",
      "Nama Pelajar",
      "Tingkatan",
      "Dorm",
      "Jenis",
      "Tarikh Keluar",
      "Tarikh Pulang",
      "Sebab",
      "Status",
      "No Waris Pengirim",
      "Diluluskan Oleh",
      "Tarikh Kelulusan",
      "Catatan",
      "Pengambil",
      "No Plat Kenderaan",
      "Nama Guard",
      "Tarikh Diambil",
      "Tarikh Dibuat"
    ];

    const csvRows = rows.map((r) => [
      r.id,
      r.namaPelajar,
      r.tingkatan,
      r.dorm,
      r.jenis === "pulang_bermalam" ? "Pulang Bermalam" : r.jenis === "outing" ? "Outing" : "MC / Sakit",
      formatDate(r.tarikhKeluar),
      formatDate(r.tarikhPulang),
      (r.sebab || "").replace(/"/g, '""'),
      r.status === "menunggu" ? "Menunggu" : r.status === "diluluskan" ? "Diluluskan" : r.status === "ditolak" ? "Ditolak" : "MC/Sakit",
      r.noWarisPengirim,
      r.diluluskanOleh || "",
      formatDateTime(r.tarikhKelulusan),
      (r.catatan || "").replace(/"/g, '""'),
      r.pengambil || "",
      r.noPendaftaran || "",
      r.guardNama || "",
      formatDateTime(r.tarikhDiambil),
      formatDateTime(r.createdAt)
    ]);

    // Use BOM \ufeff for Excel to open UTF-8 CSV correctly
    const csvContent = "\ufeff" + [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\r\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="permohonan-keluar-asrama-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
