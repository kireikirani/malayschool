import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPermohonan } from "@/db/schema";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAdmin } from "@/lib/api/with-auth";
import { fail, noContent, notFound, ok } from "@/lib/api/response";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const [row] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    if (!row) return notFound();
    return ok(row);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:admin-permohonan:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;
    const body = await req.json();

    const [permohonan] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    if (!permohonan) return notFound();

    // Perform updates
    await db
      .update(asramaPermohonan)
      .set({
        ...(body.jenis !== undefined && { jenis: body.jenis }),
        ...(body.tarikhKeluar !== undefined && { tarikhKeluar: new Date(body.tarikhKeluar) }),
        ...(body.tarikhPulang !== undefined && { tarikhPulang: body.tarikhPulang ? new Date(body.tarikhPulang) : null }),
        ...(body.sebab !== undefined && { sebab: body.sebab }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.pengambil !== undefined && { pengambil: body.pengambil }),
        ...(body.noPendaftaran !== undefined && { noPendaftaran: body.noPendaftaran }),
        ...(body.catatan !== undefined && { catatan: body.catatan }),
      })
      .where(eq(asramaPermohonan.id, Number(id)));

    const [updated] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:admin-permohonan:write`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }
    const { id } = await params;

    const [permohonan] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    if (!permohonan) return notFound();

    await db.delete(asramaPermohonan).where(eq(asramaPermohonan.id, Number(id)));
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
