import { sql, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
    const tingkatan = searchParams.get("tingkatan")?.trim() ?? "";

    const conditions = [eq(asramaPelajar.status, "active")];
    if (tingkatan) conditions.push(eq(asramaPelajar.tingkatan, tingkatan));
    if (q) conditions.push(sql`LOWER(${asramaPelajar.nama}) LIKE ${`%${q}%`}`);

    const rows = await db
      .select({
        id: asramaPelajar.id,
        nama: asramaPelajar.nama,
        tingkatan: asramaPelajar.tingkatan,
        dorm: asramaPelajar.dorm,
        noWaris: asramaPelajar.noWaris,
        noWaris2: asramaPelajar.noWaris2,
        noWaris3: asramaPelajar.noWaris3,
      })
      .from(asramaPelajar)
      .where(and(...conditions))
      .orderBy(asramaPelajar.nama)
      .limit(20);

    return ok(rows);
  } catch (err) {
    return handleApiError(err);
  }
}
