import { SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_PHONE, SCHOOL_EMAIL } from "@/lib/brand";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("==================================================");
    console.log("[EMAIL MOCK] Sending email via Resend (No API Key set)");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Content:\n${html}`);
    console.log("==================================================");
    return { success: true, message: "Email logged to console (mock)" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Asrama Sekolah <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      console.error("Resend API error:", body);
      return { success: false, error: body };
    }
    return { success: true, data: body };
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return { success: false, error: err };
  }
}

function getEmailHeader() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${baseUrl}/brand/logo.png`;
  return `
    <table style="width: 100%; margin-bottom: 24px; border-collapse: collapse;">
      <tr>
        <td style="width: 32px; vertical-align: middle; padding: 0;">
          <img src="${logoUrl}" alt="Logo" style="width: 32px; height: auto; display: block;" />
        </td>
        <td style="padding-left: 10px; vertical-align: middle; text-align: left;">
          <span style="font-size: 14px; font-weight: bold; color: #1e3a8a; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">${SCHOOL_NAME}</span>
        </td>
      </tr>
    </table>
  `;
}

function getEmailFooter() {
  return `
    <div style="border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 30px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; font-weight: 500;">${SCHOOL_NAME}</p>
      <p style="font-size: 11px; color: #94a3b8; margin: 0 0 12px 0; max-width: 360px; margin-left: auto; margin-right: auto; line-height: 1.5;">
        ${SCHOOL_ADDRESS}
      </p>
      <p style="font-size: 11px; color: #94a3b8; margin: 0;">
        Tel: ${SCHOOL_PHONE} &bull; Emel: ${SCHOOL_EMAIL}
      </p>
    </div>
  `;
}

export function getNewPermohonanEmailHtml({
  namaPelajar,
  tingkatan,
  dorm,
  jenis,
  tarikhKeluar,
  tarikhPulang,
  sebab,
}: {
  namaPelajar: string;
  tingkatan: string;
  dorm: string;
  jenis: "pulang_bermalam" | "outing" | "mc_sakit";
  tarikhKeluar: string;
  tarikhPulang: string | null;
  sebab: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${baseUrl}/brand/logo.png`;
  
  const typesMap = {
    pulang_bermalam: "Pulang Bermalam",
    outing: "Outing",
    mc_sakit: "MC / Sakit (Rawatan)",
  };

  const jenisLabel = typesMap[jenis] || jenis;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #f8fafc; margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #334155; }
        .container { margin: 0 auto; width: 100%; max-width: 600px; }
        .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
        .school-logo { width: 56px; height: auto; margin: 0 auto 16px auto; display: block; }
        .heading { font-size: 24px; color: #1e3a8a; font-weight: bold; margin: 0 0 4px 0; }
        .subheading { font-size: 12px; color: #3b82f6; font-weight: 700; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .intro-text { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: left; }
        .table-section { background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #f1f5f9; margin-bottom: 28px; text-align: left; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .info-table td.label { font-weight: 600; color: #475569; width: 130px; }
        .info-table td.value { color: #0f172a; }
        .info-table tr:last-child td { border-bottom: none; }
        .btn { background-color: #1e3a8a; color: #ffffff !important; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; display: inline-block; font-size: 15px; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="card">
          <img src="${logoUrl}" alt="Logo" class="school-logo" />
          <h1 class="heading">Permohonan Keluar</h1>
          <div class="subheading">Portal Asrama</div>
          
          <p class="intro-text">
            Assalamualaikum & Salam Sejahtera,<br/><br/>
            Terdapat permohonan keluar asrama baru yang telah dihantar oleh waris. Sila semak butiran permohonan di bawah untuk kelulusan pihak warden:
          </p>

          <div class="table-section">
            <table class="info-table">
              <tr>
                <td class="label">Nama Pelajar</td>
                <td class="value">${namaPelajar}</td>
              </tr>
              <tr>
                <td class="label">Kelas / Dorm</td>
                <td class="value">${tingkatan} / ${dorm}</td>
              </tr>
              <tr>
                <td class="label">Jenis Permohonan</td>
                <td class="value" style="font-weight: 600; color: #3b82f6;">${jenisLabel}</td>
              </tr>
              <tr>
                <td class="label">Tarikh Keluar</td>
                <td class="value">${new Date(tarikhKeluar).toLocaleDateString("ms-MY", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ${tarikhPulang ? `
              <tr>
                <td class="label">Tarikh Pulang</td>
                <td class="value">${new Date(tarikhPulang).toLocaleDateString("ms-MY", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ` : ""}
              <tr>
                <td class="label">Sebab Keluar</td>
                <td class="value">${sebab}</td>
              </tr>
            </table>
          </div>

          <a href="${baseUrl}/admin/asrama-permohonan" class="btn">Semak & Luluskan</a>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}

export function getCheckoutEmailHtml({
  namaPelajar,
  tingkatan,
  dorm,
  jenis,
  pengambil,
  noPendaftaran,
  guardNama,
  tarikhDiambil,
  noWarisPengirim,
}: {
  namaPelajar: string;
  tingkatan: string;
  dorm: string;
  jenis: "pulang_bermalam" | "outing" | "mc_sakit";
  pengambil: string;
  noPendaftaran: string;
  guardNama: string;
  tarikhDiambil: Date;
  noWarisPengirim: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${baseUrl}/brand/logo.png`;

  const typesMap = {
    pulang_bermalam: "Pulang Bermalam",
    outing: "Outing",
    mc_sakit: "MC / Sakit (Rawatan)",
  };

  const waktuDiambil = tarikhDiambil.toLocaleString("ms-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #f8fafc; margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #334155; }
        .container { margin: 0 auto; width: 100%; max-width: 600px; }
        .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
        .school-logo { width: 56px; height: auto; margin: 0 auto 16px auto; display: block; }
        .heading { font-size: 24px; color: #1e3a8a; font-weight: bold; margin: 0 0 4px 0; }
        .subheading { font-size: 12px; color: #3b82f6; font-weight: 700; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 700; color: #16a34a; background-color: #f0fdf4; border: 1px solid #bbf7d0; text-transform: uppercase; margin-bottom: 24px; }
        .intro-text { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: left; }
        .table-section { background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #f1f5f9; margin-bottom: 28px; text-align: left; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .info-table td.label { font-weight: 600; color: #475569; width: 140px; }
        .info-table td.value { color: #0f172a; }
        .info-table tr:last-child td { border-bottom: none; }
        .btn { background-color: #1e3a8a; color: #ffffff !important; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; display: inline-block; font-size: 15px; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="card">
          <img src="${logoUrl}" alt="Logo" class="school-logo" />
          <h1 class="heading">Pelajar Telah Diambil</h1>
          <div class="subheading">Pengesahan Pengambilan Asrama</div>

          <div class="status-badge">Selamat Keluar Asrama</div>

          <p class="intro-text">
            Assalamualaikum & Salam Sejahtera,<br/><br/>
            Pihak pengawal (guard) mengesahkan bahawa pelajar berikut telah diambil dari asrama. Sila semak butiran pengambilan di bawah:
          </p>

          <div class="table-section">
            <table class="info-table">
              <tr>
                <td class="label">Nama Pelajar</td>
                <td class="value">${namaPelajar}</td>
              </tr>
              <tr>
                <td class="label">Kelas / Dorm</td>
                <td class="value">${tingkatan} / ${dorm}</td>
              </tr>
              <tr>
                <td class="label">Jenis Permohonan</td>
                <td class="value">${typesMap[jenis] || jenis}</td>
              </tr>
              <tr>
                <td class="label">Diambil Oleh</td>
                <td class="value" style="font-weight: 600;">${pengambil}</td>
              </tr>
              <tr>
                <td class="label">No. Pendaftaran</td>
                <td class="value">${noPendaftaran}</td>
              </tr>
              <tr>
                <td class="label">Direkod Oleh</td>
                <td class="value">${guardNama} (Guard)</td>
              </tr>
              <tr>
                <td class="label">Waktu Diambil</td>
                <td class="value">${waktuDiambil}</td>
              </tr>
            </table>
          </div>

          <p class="intro-text" style="font-size: 13px; color: #64748b;">
            Sekiranya maklumat di atas tidak tepat atau anda tidak menghantar sesiapa untuk mengambil pelajar, sila hubungi pihak asrama dengan segera.
          </p>

          <a href="${baseUrl}/asrama/permohonan/semak?noWaris=${encodeURIComponent(noWarisPengirim)}" class="btn">Semak Butiran Pengambilan</a>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}

export function getStatusUpdateEmailHtml({
  namaPelajar,
  tingkatan,
  jenis,
  tarikhKeluar,
  tarikhPulang,
  status,
  catatan,
  noWarisPengirim,
}: {
  namaPelajar: string;
  tingkatan: string;
  jenis: "pulang_bermalam" | "outing" | "mc_sakit";
  tarikhKeluar: Date | string;
  tarikhPulang: Date | string | null;
  status: "menunggu" | "diluluskan" | "ditolak" | "mc";
  catatan: string | null;
  noWarisPengirim: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${baseUrl}/brand/logo.png`;
  
  const typesMap = {
    pulang_bermalam: "Pulang Bermalam",
    outing: "Outing",
    mc_sakit: "MC / Sakit (Rawatan)",
  };

  const statusMap = {
    diluluskan: "DILULUSKAN (Sila ambil di asrama)",
    ditolak: "DITOLAK",
    mc: "MC / SAKIT (DILULUSKAN)",
    menunggu: "MENUNGGU",
  };

  const isDitolak = status === "ditolak";
  const statusColor = isDitolak ? "#dc2626" : "#16a34a";
  const statusBg = isDitolak ? "#fef2f2" : "#f0fdf4";
  const statusBorder = isDitolak ? "#fecaca" : "#bbf7d0";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { background-color: #f8fafc; margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #334155; }
        .container { margin: 0 auto; width: 100%; max-width: 600px; }
        .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
        .school-logo { width: 56px; height: auto; margin: 0 auto 16px auto; display: block; }
        .heading { font-size: 24px; color: #1e3a8a; font-weight: bold; margin: 0 0 4px 0; }
        .subheading { font-size: 12px; color: #3b82f6; font-weight: 700; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .intro-text { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0; text-align: left; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 700; color: ${statusColor}; background-color: ${statusBg}; border: 1px solid ${statusBorder}; text-transform: uppercase; margin-bottom: 24px; }
        .table-section { background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #f1f5f9; margin-bottom: 28px; text-align: left; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .info-table td.label { font-weight: 600; color: #475569; width: 130px; }
        .info-table td.value { color: #0f172a; }
        .info-table tr:last-child td { border-bottom: none; }
        .btn { background-color: #1e3a8a; color: #ffffff !important; padding: 12px 24px; text-decoration: none; font-weight: 600; border-radius: 6px; display: inline-block; font-size: 15px; margin: 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        ${getEmailHeader()}
        <div class="card">
          <img src="${logoUrl}" alt="Logo" class="school-logo" />
          <h1 class="heading">Status Permohonan</h1>
          <div class="subheading">Keputusan Keluar Asrama</div>
          
          <div class="status-badge">
            ${statusMap[status] || status}
          </div>

          <p class="intro-text">
            Assalamualaikum & Salam Sejahtera,<br/><br/>
            Status permohonan keluar asrama untuk pelajar berikut telah dikemaskini oleh pihak warden/sekolah:
          </p>

          <div class="table-section">
            <table class="info-table">
              <tr>
                <td class="label">Nama Pelajar</td>
                <td class="value">${namaPelajar}</td>
              </tr>
              <tr>
                <td class="label">Tingkatan</td>
                <td class="value">${tingkatan}</td>
              </tr>
              <tr>
                <td class="label">Jenis Permohonan</td>
                <td class="value">${typesMap[jenis] || jenis}</td>
              </tr>
              <tr>
                <td class="label">Tarikh Keluar</td>
                <td class="value">${new Date(tarikhKeluar).toLocaleDateString("ms-MY", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ${tarikhPulang ? `
              <tr>
                <td class="label">Tarikh Pulang</td>
                <td class="value">${new Date(tarikhPulang).toLocaleDateString("ms-MY", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              ` : ""}
              ${catatan ? `
              <tr>
                <td class="label">Catatan Warden</td>
                <td class="value" style="color: #dc2626; font-weight: 500;">${catatan}</td>
              </tr>
              ` : ""}
            </table>
          </div>

          <a href="${baseUrl}/asrama/permohonan/semak?noWaris=${encodeURIComponent(noWarisPengirim)}" class="btn">Semak Butiran Pengambilan</a>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}
