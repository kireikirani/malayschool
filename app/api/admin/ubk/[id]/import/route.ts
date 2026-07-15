import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ubkLinks, psikometrikResults } from "@/db/schema";
import { handleApiError, ApiError } from "@/lib/api/error-handler";
import { notFound, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/with-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeCell, sanitizeScores, normalizeIc } from "@/lib/sanitize";

const FIXED_COLS = new Set([
  "nopengenalan", "no pengenalan", "no_pengenalan", "id pengenalan", "id_pengenalan",
  "namamurid", "nama murid", "nama_murid", "nama",
  "kodsekolah", "kod sekolah", "kod_sekolah",
  "namasekolah", "nama sekolah", "nama_sekolah",
  "namakelas", "nama kelas", "nama_kelas",
  "tarikh", "jantina", "bil", "skor keseluruhan", "skor_keseluruhan", "status taksir", "status_taksir", "catatan",
]);

function sheetUrlToCsvUrl(rawUrl: string): string {
  // Format published: /spreadsheets/d/e/PUB_ID/pub?...
  if (/\/spreadsheets\/d\/e\/[A-Za-z0-9_-]+\/pub/.test(rawUrl)) {
    const url = new URL(rawUrl);
    url.searchParams.set("output", "csv");
    url.searchParams.set("single", "true");
    return url.toString();
  }

  // Format biasa: /spreadsheets/d/SHEET_ID/edit#gid=...
  const idMatch = rawUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!idMatch || idMatch[1] === "e") throw new ApiError("URL Google Sheets tidak sah", 400);
  const sheetId = idMatch[1];
  const gidMatch = rawUrl.match(/[#&?]gid=(\d+)/);
  const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  function splitRow(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = splitRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function resolveField(row: Record<string, string>, ...candidates: string[]): string {
  for (const key of candidates) {
    const found = Object.keys(row).find((k) => k.toLowerCase().trim() === key.toLowerCase());
    if (found && row[found]?.trim()) return sanitizeCell(row[found]);
  }
  return "";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    if (!rateLimit(`${getClientIp(req)}:ubk:import`, 10, 60_000)) {
      throw new ApiError("Too many requests", 429);
    }

    const { id } = await params;
    const numId = Number(id);
    const [link] = await db.select().from(ubkLinks).where(eq(ubkLinks.id, numId)).limit(1);
    if (!link) return notFound("Link tidak ditemui");

    const csvUrl = sheetUrlToCsvUrl(link.sheetUrl);
    const res = await fetch(csvUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new ApiError(`Gagal mengambil data dari Google Sheets (${res.status})`, 502);

    const text = await res.text();
    const csvRows = parseCsv(text);
    if (csvRows.length === 0) throw new ApiError("Tiada data dalam sheet atau format tidak dikenali", 400);

    const scoreHeaders = Object.keys(csvRows[0]).filter((h) => !FIXED_COLS.has(h.toLowerCase().trim()));

    // Build records, skip rows with missing required fields
    type PsikRecord = {
      noPengenalan: string;
      namaMurid: string;
      kodSekolah?: string;
      namaSekolah?: string;
      namaKelas?: string;
      tarikh?: string;
      scoresJson: string;
    };

    const records: PsikRecord[] = [];
    for (const row of csvRows) {
      const noPengenalan = normalizeIc(resolveField(row, "noPengenalan", "No Pengenalan", "no_pengenalan", "ID Pengenalan", "id_pengenalan"));
      const namaMurid = resolveField(row, "namaMurid", "Nama Murid", "nama_murid", "Nama");
      if (!noPengenalan || noPengenalan.length < 6 || !namaMurid) continue;

      const rawScores: Record<string, number> = {};
      for (const h of scoreHeaders) {
        const num = Number(row[h]);
        if (isFinite(num) && row[h].trim() !== "") rawScores[h] = num;
      }

      records.push({
        noPengenalan,
        namaMurid,
        kodSekolah: resolveField(row, "kodSekolah", "Kod Sekolah", "kod_sekolah") || undefined,
        namaSekolah: resolveField(row, "namaSekolah", "Nama Sekolah", "nama_sekolah") || undefined,
        namaKelas: resolveField(row, "namaKelas", "Nama Kelas", "nama_kelas") || undefined,
        tarikh: resolveField(row, "tarikh", "Tarikh") || undefined,
        scoresJson: JSON.stringify(sanitizeScores(rawScores)),
      });
    }

    if (records.length === 0) throw new ApiError("Tiada rekod sah dijumpai dalam sheet", 400);

    // Batch lookup for accurate insert/update counts
    const allIc = records.map((r) => r.noPengenalan);
    const existing = await db
      .select({ noPengenalan: psikometrikResults.noPengenalan })
      .from(psikometrikResults)
      .where(inArray(psikometrikResults.noPengenalan, allIc));

    const existingSet = new Set(existing.map((r) => r.noPengenalan));
    const inserted = records.filter((r) => !existingSet.has(r.noPengenalan)).length;
    const updated = records.filter((r) => existingSet.has(r.noPengenalan)).length;

    await db.insert(psikometrikResults).values(records).onDuplicateKeyUpdate({
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

    const now = new Date();
    await db.update(ubkLinks).set({
      lastImportedAt: now,
      lastImportCount: inserted + updated,
      updatedAt: now,
    }).where(eq(ubkLinks.id, numId));

    return ok({ inserted, updated, message: `${inserted} rekod ditambah, ${updated} rekod dikemaskini.` });
  } catch (err) {
    return handleApiError(err);
  }
}
