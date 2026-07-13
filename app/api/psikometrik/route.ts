import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { psikometrikResults } from "@/db/schema";
import { fail, ok, notFound } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const noPengenalan = url.searchParams.get("noPengenalan")?.trim();
    if (!noPengenalan || noPengenalan.length < 6) {
      return fail("Sila masukkan nombor pengenalan yang sah", 400);
    }

    const [row] = await db
      .select()
      .from(psikometrikResults)
      .where(eq(psikometrikResults.noPengenalan, noPengenalan))
      .limit(1);

    if (!row) return notFound("Keputusan tidak dijumpai");

    let scores: Record<string, number> = {};
    try {
      scores = JSON.parse(row.scoresJson);
    } catch {
      scores = {};
    }

    return ok({
      noPengenalan: row.noPengenalan,
      namaMurid: row.namaMurid,
      kodSekolah: row.kodSekolah,
      namaSekolah: row.namaSekolah,
      namaKelas: row.namaKelas,
      tarikh: row.tarikh,
      scores,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
