import { inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { psikometrikResults } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { psikometrikImportSchema } from "@/lib/validations/psikometrik.schema";
import { parseBody } from "@/lib/api/validate-request";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:psikometrik:import`, 5, 60_000)) {
      return ok({ inserted: 0, updated: 0, message: "Too many requests" });
    }

    const { rows } = await parseBody(req, psikometrikImportSchema);
    const values = rows.map(({ scores, ...rest }) => ({ ...rest, scoresJson: JSON.stringify(scores) }));

    const allIc = rows.map((r) => r.noPengenalan);
    const existing = await db
      .select({ noPengenalan: psikometrikResults.noPengenalan })
      .from(psikometrikResults)
      .where(inArray(psikometrikResults.noPengenalan, allIc));

    const existingSet = new Set(existing.map((r) => r.noPengenalan));
    const inserted = values.filter((r) => !existingSet.has(r.noPengenalan)).length;
    const updated = values.filter((r) => existingSet.has(r.noPengenalan)).length;

    await db.insert(psikometrikResults).values(values).onDuplicateKeyUpdate({
      set: {
        namaMurid: sql`VALUES(${psikometrikResults.namaMurid})`,
        kodSekolah: sql`VALUES(${psikometrikResults.kodSekolah})`,
        namaSekolah: sql`VALUES(${psikometrikResults.namaSekolah})`,
        namaKelas: sql`VALUES(${psikometrikResults.namaKelas})`,
        tarikh: sql`VALUES(${psikometrikResults.tarikh})`,
        scoresJson: sql`VALUES(${psikometrikResults.scoresJson})`,
        updatedAt: sql`NOW()`,
      },
    });

    return ok({ inserted, updated, message: `${inserted} rekod ditambah, ${updated} rekod dikemaskini.` });
  } catch (err) {
    return handleApiError(err);
  }
}
