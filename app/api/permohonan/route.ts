import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar, asramaPermohonan } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { created, fail, ok } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { createPermohonanSchema } from "@/lib/validations/asrama-permohonan.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noWaris = searchParams.get("noWaris")?.trim();

    if (!noWaris) {
      throw new ApiError("Nombor telefon waris diperlukan", 400);
    }

    // Get all permohonan that match this noWaris
    const rows = await db
      .select({
        id: asramaPermohonan.id,
        namaPelajar: asramaPermohonan.namaPelajar,
        tingkatan: asramaPermohonan.tingkatan,
        dorm: asramaPermohonan.dorm,
        jenis: asramaPermohonan.jenis,
        tarikhKeluar: asramaPermohonan.tarikhKeluar,
        tarikhPulang: asramaPermohonan.tarikhPulang,
        sebab: asramaPermohonan.sebab,
        status: asramaPermohonan.status,
        diluluskanOleh: asramaPermohonan.diluluskanOleh,
        tarikhKelulusan: asramaPermohonan.tarikhKelulusan,
        catatan: asramaPermohonan.catatan,
        pengambil: asramaPermohonan.pengambil,
        noPendaftaran: asramaPermohonan.noPendaftaran,
        guardNama: asramaPermohonan.guardNama,
        tarikhDiambil: asramaPermohonan.tarikhDiambil,
        createdAt: asramaPermohonan.createdAt,
      })
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.noWarisPengirim, noWaris))
      .orderBy(desc(asramaPermohonan.createdAt));

    return ok(rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`${ip}:permohonan:create`, 5, 60_000)) {
      return fail("Terlalu banyak cubaan. Sila cuba lagi selepas seminit.", 429);
    }

    const body = await parseBody(req, createPermohonanSchema);



    // 1. Verify identity against asramaPelajar
    const inputNama = body.nama.trim().toLowerCase();
    const inputNoWaris = body.noWaris.trim();

    const activeStudents = await db
      .select()
      .from(asramaPelajar)
      .where(
        and(
          eq(asramaPelajar.status, "active"),
          eq(asramaPelajar.noWaris, inputNoWaris)
        )
      );

    // Match name case-insensitively
    const student = activeStudents.find(
      s => s.nama.toLowerCase() === inputNama ||
           s.nama.toLowerCase().includes(inputNama) ||
           inputNama.includes(s.nama.toLowerCase())
    );

    if (!student) {
      throw new ApiError("Maklumat pelajar tidak sah atau tiada dalam rekod asrama.", 400);
    }

    // 2. Create the permohonan
    const [result] = await db.insert(asramaPermohonan).values({
      pelajarId: student.id,
      namaPelajar: student.nama, // Snapshot
      tingkatan: student.tingkatan, // Snapshot
      dorm: student.dorm, // Snapshot
      jenis: body.jenis,
      tarikhKeluar: new Date(body.tarikhKeluar),
      tarikhPulang: body.tarikhPulang ? new Date(body.tarikhPulang) : null,
      sebab: body.sebab,
      status: "menunggu",
      noWarisPengirim: inputNoWaris,
    });

    const [row] = await db.select().from(asramaPermohonan).where(eq(asramaPermohonan.id, result.insertId)).limit(1);
    return created(row);
  } catch (err) {
    return handleApiError(err);
  }
}
