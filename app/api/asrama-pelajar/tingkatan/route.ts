import { sql, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { ok } from "@/lib/api/response";

export async function GET() {
  try {
    const rows = await db
      .selectDistinct({ tingkatan: asramaPelajar.tingkatan })
      .from(asramaPelajar)
      .where(eq(asramaPelajar.status, "active"))
      .orderBy(asramaPelajar.tingkatan);

    const options = rows.map((r) => r.tingkatan).filter(Boolean);
    return ok(options);
  } catch (err) {
    return handleApiError(err);
  }
}
