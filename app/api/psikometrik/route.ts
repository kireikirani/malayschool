import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { psikometrikResults } from "@/db/schema";
import { fail, ok, notFound } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { normalizeIc } from "@/lib/sanitize";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = url.searchParams.get("noPengenalan")?.trim() ?? "";
    const noPengenalan = normalizeIc(raw);
    if (!noPengenalan || noPengenalan.length < 6) {
      return fail("Sila masukkan nombor pengenalan yang sah", 400);
    }

    // REPLACE() handles legacy records stored with dashes (e.g. "100124-10-0969")
    const [row] = await db
      .select()
      .from(psikometrikResults)
      .where(sql`REPLACE(REPLACE(${psikometrikResults.noPengenalan}, '-', ''), ' ', '') = ${noPengenalan}`)
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
