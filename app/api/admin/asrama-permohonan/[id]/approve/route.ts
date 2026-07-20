import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPermohonan, asramaWardens, teachers, user } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { getSessionOrThrow } from "@/lib/api/with-auth";
import { ok, fail } from "@/lib/api/response";
import { parseBody } from "@/lib/api/validate-request";
import { approvePermohonanSchema } from "@/lib/validations/asrama-permohonan.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, getStatusUpdateEmailHtml } from "@/lib/email";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await getSessionOrThrow(req);
    // Allow both Admin and Teacher (Warden) to approve/reject permohonan
    if (session.user.role !== "admin" && session.user.role !== "teacher") {
      throw new ApiError("Forbidden", 403);
    }

    if (!rateLimit(`${getClientIp(req)}:admin-permohonan:approve`, 20, 60_000)) {
      return fail("Too many requests", 429);
    }

    const { id } = await params;
    const body = await parseBody(req, approvePermohonanSchema);

    const [permohonan] = await db
      .select()
      .from(asramaPermohonan)
      .where(eq(asramaPermohonan.id, Number(id)))
      .limit(1);

    if (!permohonan) {
      throw new ApiError("Rekod permohonan tidak ditemui", 404);
    }

    // Update status and approval info
    await db
      .update(asramaPermohonan)
      .set({
        status: body.status,
        catatan: body.catatan || null,
        diluluskanOleh: session.user.name,
        approverUserId: session.user.id,
        tarikhKelulusan: new Date(),
      })
      .where(eq(asramaPermohonan.id, Number(id)));

    // Send email to parent/waris and all wardens
    try {
      const wardens = await db
        .select({
          email: user.email,
        })
        .from(asramaWardens)
        .leftJoin(teachers, eq(asramaWardens.teacherId, teachers.id))
        .leftJoin(user, eq(teachers.userId, user.id));

      const wardenEmails = wardens
        .map(w => w.email)
        .filter((email): email is string => !!email);

      const recipients = [permohonan.emailWaris, ...wardenEmails].filter(
        (email): email is string => !!email
      );

      if (recipients.length > 0) {
        const emailContent = getStatusUpdateEmailHtml({
          namaPelajar: permohonan.namaPelajar,
          tingkatan: permohonan.tingkatan,
          jenis: permohonan.jenis,
          tarikhKeluar: permohonan.tarikhKeluar,
          tarikhPulang: permohonan.tarikhPulang,
          status: body.status,
          catatan: body.catatan || null,
          noWarisPengirim: permohonan.noWarisPengirim,
        });

        await sendEmail({
          to: recipients,
          subject: `Status Permohonan Keluar Asrama: ${permohonan.namaPelajar} - ${body.status.toUpperCase()}`,
          html: emailContent,
        });
      }
    } catch (emailErr) {
      console.error("Gagal menghantar emel kepada waris/warden:", emailErr);
    }

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
