"use client";

import { useRef, useState } from "react";
import { read, utils } from "xlsx";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiSend } from "@/lib/fetcher";
import { sanitizeCell, sanitizeScoreKey, sanitizeScores } from "@/lib/sanitize";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv", "application/csv"]);
const ALLOWED_EXT = /\.(xlsx|xls|csv)$/i;

const FIXED_COLS = new Set([
  "noPengenalan", "no pengenalan", "no_pengenalan", "id pengenalan", "id_pengenalan",
  "namaMurid", "nama murid", "nama_murid", "nama",
  "kodSekolah", "kod sekolah", "kod_sekolah",
  "namaSekolah", "nama sekolah", "nama_sekolah",
  "namaKelas", "nama kelas", "nama_kelas",
  "tarikh", "jantina", "bil", "skor keseluruhan", "skor_keseluruhan", "status taksir", "status_taksir", "catatan",
].map((s) => s.toLowerCase()));

type ImportRow = {
  noPengenalan: string;
  namaMurid: string;
  kodSekolah?: string;
  namaSekolah?: string;
  namaKelas?: string;
  tarikh?: string;
  scores: Record<string, number>;
};

type ImportResult = { inserted: number; updated: number; message: string };

export function PsikometrikImport({ onSuccess }: { onSuccess: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function parseExcel(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (json.length === 0) {
          setError("Fail Excel kosong atau tiada data.");
          return;
        }

        const headers = Object.keys(json[0]);
        const scoreHeaders = headers.filter((h) => !FIXED_COLS.has(h.toLowerCase().trim()));

        function resolveField(raw: Record<string, unknown>, ...candidates: string[]): string {
          for (const key of candidates) {
            const found = Object.keys(raw).find((k) => k.toLowerCase().trim() === key.toLowerCase());
            if (found !== undefined && String(raw[found] ?? "").trim()) return sanitizeCell(String(raw[found]));
          }
          return "";
        }

        const rows: ImportRow[] = json.map((raw, i) => {
          const cell = (val: unknown) => sanitizeCell(String(val ?? ""));

          const noPengenalan = resolveField(raw, "noPengenalan", "No Pengenalan", "no_pengenalan", "ID Pengenalan", "id_pengenalan");
          const namaMurid = resolveField(raw, "namaMurid", "Nama Murid", "nama_murid", "Nama");

          if (!noPengenalan || noPengenalan.length < 6) {
            throw new Error(`Baris ${i + 2}: noPengenalan tidak sah — "${noPengenalan}"`);
          }
          if (!namaMurid) {
            throw new Error(`Baris ${i + 2}: namaMurid kosong`);
          }

          const rawScores: Record<string, number> = {};
          for (const h of scoreHeaders) {
            const key = sanitizeScoreKey(h);
            if (!key) continue;
            const num = Number(raw[h]);
            if (isFinite(num)) rawScores[key] = num;
          }

          return {
            noPengenalan,
            namaMurid,
            kodSekolah: cell(raw["kodSekolah"] ?? raw["Kod Sekolah"] ?? raw["kod_sekolah"]) || undefined,
            namaSekolah: cell(raw["namaSekolah"] ?? raw["Nama Sekolah"] ?? raw["nama_sekolah"]) || undefined,
            namaKelas: cell(raw["namaKelas"] ?? raw["Nama Kelas"] ?? raw["nama_kelas"]) || undefined,
            tarikh: cell(raw["tarikh"] ?? raw["Tarikh"]) || undefined,
            scores: sanitizeScores(rawScores),
          };
        });

        setPreview(rows);
        setError(null);
        setResult(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membaca fail Excel.");
        setPreview([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("Saiz fail melebihi had 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!ALLOWED_EXT.test(file.name) && !ALLOWED_MIME.has(file.type)) {
      setError("Hanya fail .xlsx, .xls, atau .csv dibenarkan.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setResult(null);
    parseExcel(file);
  }

  function handleClear() {
    setFileName(null);
    setPreview([]);
    setError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setIsImporting(true);
    try {
      const res = await apiSend<ImportResult>("/api/admin/psikometrik/import", "POST", { rows: preview });
      setResult(res);
      toast.success(res.message);
      handleClear();
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import gagal");
    } finally {
      setIsImporting(false);
    }
  }

  const scoreKeys = preview.length > 0 ? Object.keys(preview[0].scores) : [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Muat naik fail Excel (.xlsx / .xls). Lajur yang diperlukan:{" "}
          <code className="rounded bg-muted px-1 text-xs">noPengenalan</code>,{" "}
          <code className="rounded bg-muted px-1 text-xs">namaMurid</code>. Lajur lain (skor tret) akan diimport secara automatik.
        </p>

        {!fileName ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center hover:border-muted-foreground/50 hover:bg-muted/40 transition-colors">
            <Upload className="size-8 text-muted-foreground" />
            <span className="text-sm font-medium">Klik untuk pilih fail Excel</span>
            <span className="text-xs text-muted-foreground">.xlsx, .xls</span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <FileSpreadsheet className="size-5 shrink-0 text-green-600" />
            <span className="flex-1 truncate text-sm font-medium">{fileName}</span>
            <Button type="button" variant="ghost" size="icon-sm" onClick={handleClear}>
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>{result.message}</span>
        </div>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{preview.length} rekod dijumpai — pratonton 5 pertama</p>
            <Button onClick={handleImport} disabled={isImporting} size="sm">
              {isImporting ? "Mengimport..." : `Import ${preview.length} Rekod`}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border text-xs">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">No. Pengenalan</th>
                  <th className="px-3 py-2 text-left font-medium">Nama Murid</th>
                  <th className="px-3 py-2 text-left font-medium">Kelas</th>
                  {scoreKeys.map((k) => (
                    <th key={k} className="px-3 py-2 text-left font-medium">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2 font-mono">{row.noPengenalan}</td>
                    <td className="px-3 py-2">{row.namaMurid}</td>
                    <td className="px-3 py-2">{row.namaKelas ?? "—"}</td>
                    {scoreKeys.map((k) => (
                      <td key={k} className="px-3 py-2">{row.scores[k] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
                {preview.length > 5 && (
                  <tr className="border-t">
                    <td colSpan={3 + scoreKeys.length} className="px-3 py-2 text-center text-muted-foreground">
                      ...dan {preview.length - 5} rekod lagi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
