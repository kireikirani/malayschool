import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPermohonan, asramaWardens, teachers, user } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { getSessionOrThrow } from "@/lib/api/with-auth";
import { ok, fail } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { checkoutSchema } from "@/lib/validations/asrama-permohonan.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, getCheckoutEmailHtml } from "@/lib/email";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await getSessionOrThrow(req);
    if (session.user.role !== "admin" && session.user.role !== "guard") {
      throw new ApiError("Forbidden", 403);
    }

    if (!rateLimit(`${getClientIp(req)}:guard-checkout`, 30, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, checkoutSchema);

    // Fetch permohonan
    const [permohonan] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    if (!permohonan) {
      throw new ApiError("Rekod permohonan tidak ditemui", 404);
    }

    if (permohonan.status !== "diluluskan" && permohonan.status !== "mc") {
      throw new ApiError("Pelajar tidak dibenarkan keluar kerana permohonan tidak bertaraf diluluskan/MC", 400);
    }

    if (permohonan.tarikhDiambil) {
      throw new ApiError("Pengambilan pelajar telah pun direkodkan sebelum ini", 400);
    }

    // Update checkout details
    await db
      .update(asramaPermohonan)
      .set({
        pengambil: body.pengambil,
        noPendaftaran: body.noPendaftaran,
        guardUserId: session.user.id,
        guardNama: session.user.name,
        tarikhDiambil: new Date(),
      })
      .where(eq(asramaPermohonan.id, Number(id)));

    const [updated] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    // Send email to waris (and wardens as CC-list) confirming checkout
    try {
      const wardens = await db
        .select({ email: user.email })
        .from(asramaWardens)
        .leftJoin(teachers, eq(asramaWardens.teacherId, teachers.id))
        .leftJoin(user, eq(teachers.userId, user.id));

      const wardenEmails = wardens
        .map((w) => w.email)
        .filter((email): email is string => !!email);

      const recipients = [updated.emailWaris, ...wardenEmails].filter(
        (email): email is string => !!email
      );

      if (recipients.length > 0 && updated.tarikhDiambil) {
        const emailContent = getCheckoutEmailHtml({
          namaPelajar: updated.namaPelajar,
          tingkatan: updated.tingkatan,
          dorm: updated.dorm,
          jenis: updated.jenis,
          pengambil: updated.pengambil ?? body.pengambil,
          noPendaftaran: updated.noPendaftaran ?? body.noPendaftaran,
          guardNama: updated.guardNama ?? session.user.name,
          tarikhDiambil: updated.tarikhDiambil,
          noWarisPengirim: updated.noWarisPengirim,
        });

        await sendEmail({
          to: recipients,
          subject: `Pelajar Telah Diambil dari Asrama: ${updated.namaPelajar}`,
          html: emailContent,
        });
      }
    } catch (emailErr) {
      console.error("Gagal menghantar emel pengesahan pengambilan:", emailErr);
    }

    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
