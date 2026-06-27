import * as XLSX from "xlsx";
import { getExtension } from "@/lib/file-type";

export type SheetTable = {
  name: string;
  headers: string[];
  rows: string[][];
};

const MAX_ROWS = 200;
const MAX_TEXT_LINES = 120;

export async function parseXlsxFromUrl(url: string): Promise<SheetTable[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Gagal memuat fail (${res.status})`);

  const ext = getExtension(url);
  const workbook =
    ext === "csv"
      ? XLSX.read(await res.text(), { type: "string" })
      : XLSX.read(await res.arrayBuffer(), { type: "array" });

  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });
    const [headerRow, ...dataRows] = rows;
    const headers = (headerRow ?? []).map((cell) => String(cell ?? ""));
    return {
      name,
      headers,
      rows: dataRows.slice(0, MAX_ROWS).map((row) => headers.map((_, i) => String(row[i] ?? ""))),
    };
  });
}

export async function parseTextPreviewFromUrl(url: string): Promise<string[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Gagal memuat fail (${res.status})`);

  const text = await res.text();
  return text
    .split(/\r?\n/)
    .slice(0, MAX_TEXT_LINES)
    .map((line) => line.replace(/\t/g, "    "));
}
