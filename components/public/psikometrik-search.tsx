"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2, AlertCircle, User, School, Calendar, GraduationCap, Info, Printer, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Result = {
  noPengenalan: string;
  namaMurid: string;
  kodSekolah: string | null;
  namaSekolah: string | null;
  namaKelas: string | null;
  tarikh: string | null;
  scores: Record<string, number>;
};

const CONSTRUCTS: Array<{ code: string; nama: string; penerangan: { rendah: string; sederhana: string; tinggi: string } }> = [
  { code: "AUT", nama: "Autonomi", penerangan: {
    rendah: "Kurang keupayaan bertindak secara autonomi. Bergantung pada arahan orang lain.",
    sederhana: "Mempunyai ciri-ciri autonomi pada tahap sederhana dari segi keakuran, kebebasan dan mengawal aktiviti harian.",
    tinggi: "Sangat autonomi. Berani buat keputusan sendiri, bebas dan berkeyakinan tinggi dalam tindakan.",
  } },
  { code: "KTF", nama: "Kreatif", penerangan: {
    rendah: "Kurang cenderung kepada idea baharu dan cara berfikir yang berbeza.",
    sederhana: "Mempunyai ciri-ciri kreatif pada tahap sederhana. Kebanyakan hal, anda selesa dengan cara biasa.",
    tinggi: "Sangat kreatif. Suka mencipta idea baharu, imaginatif dan menghasilkan sesuatu yang original.",
  } },
  { code: "AGF", nama: "Agresif", penerangan: {
    rendah: "Cenderung lembut, mengalah dan mengelakkan konfrontasi.",
    sederhana: "Mempunyai ciri asertif pada tahap sederhana. Dalam kebanyakan hal, anda selesa berkongsi pendapat.",
    tinggi: "Sangat asertif. Berani menyuarakan pendapat dan mempertahankan hak.",
  } },
  { code: "EKT", nama: "Ekstrovet", penerangan: {
    rendah: "Lebih pendiam dan selesa dalam kumpulan kecil atau bersendirian.",
    sederhana: "Mempunyai ciri ekstrovet pada tahap sederhana dalam hubungan bersama orang lain.",
    tinggi: "Sangat ekstrovet. Peramah, suka berinteraksi dan mudah mesra dengan orang lain.",
  } },
  { code: "PCP", nama: "Pencapaian", penerangan: {
    rendah: "Kurang mengejar pencapaian tinggi; selesa dengan hasil semasa.",
    sederhana: "Mempunyai motivasi dan pencapaian yang sederhana.",
    tinggi: "Sangat berorientasikan pencapaian. Sentiasa menetapkan matlamat dan berusaha untuk cemerlang.",
  } },
  { code: "KPG", nama: "Kepelbagaian", penerangan: {
    rendah: "Selesa dengan rutin dan kurang selesa dengan perubahan.",
    sederhana: "Mempunyai tahap kepelbagaian yang sederhana.",
    tinggi: "Sangat suka kepelbagaian dan pengalaman baharu. Kerja rutin sangat membosankan.",
  } },
  { code: "ITL", nama: "Intelektual", penerangan: {
    rendah: "Kurang minat pada perkara berbentuk akademik atau ilmiah.",
    sederhana: "Mempunyai minat pada tahap sederhana pada ilmu pengetahuan, akademik dan ilmiah.",
    tinggi: "Sangat berminat dengan ilmu, suka membaca dan mencari ilmu berterusan.",
  } },
  { code: "KPN", nama: "Kepimpinan", penerangan: {
    rendah: "Selesa mengikut dan tidak selesa mempimpin.",
    sederhana: "Mempunyai ciri kepimpinan pada tahap sederhana.",
    tinggi: "Sangat berupaya memimpin, tegas, tidak takut membuat keputusan dan suka menjadi ketua.",
  } },
  { code: "STR", nama: "Struktur", penerangan: {
    rendah: "Lebih fleksibel dan selesa dengan kerja tanpa struktur.",
    sederhana: "Mempunyai ciri personaliti struktur pada tahap sederhana.",
    tinggi: "Sangat sistematik. Suka kepada peraturan, susunan dan kestabilan.",
  } },
  { code: "RSL", nama: "Resilien", penerangan: {
    rendah: "Mudah terkesan dengan cabaran dan tekanan.",
    sederhana: "Mempunyai ciri ketahanan psikologi pada tahap sederhana.",
    tinggi: "Sangat tabah dan cekal. Mampu bangkit semula daripada kegagalan.",
  } },
  { code: "MLG", nama: "Menolong", penerangan: {
    rendah: "Kurang cenderung untuk menolong secara aktif.",
    sederhana: "Mempunyai ciri menolong pada tahap sederhana.",
    tinggi: "Sangat prihatin, peka, mudah menghulurkan bantuan secara sukarela.",
  } },
  { code: "ATL", nama: "Analitikal", penerangan: {
    rendah: "Kurang teliti dalam menganalisis, cenderung membuat keputusan berdasarkan perasaan.",
    sederhana: "Mempunyai ciri analitikal pada tahap sederhana.",
    tinggi: "Sangat teliti, kritis dan analitis. Suka mengkaji sesuatu secara mendalam.",
  } },
  { code: "KD", nama: "Kritik Diri", penerangan: {
    rendah: "Kurang peka terhadap kesalahan diri.",
    sederhana: "Mempunyai ciri kritik diri pada tahap sederhana.",
    tinggi: "Sangat kritikal terhadap diri sendiri, cepat mengaku silap dan sentiasa memperbaiki diri.",
  } },
  { code: "WSN", nama: "Wawasan", penerangan: {
    rendah: "Kurang memikirkan masa depan secara jauh.",
    sederhana: "Mempunyai wawasan pada tahap sederhana.",
    tinggi: "Sangat berwawasan, mempunyai hala tuju dan visi masa depan yang jelas.",
  } },
  { code: "KTN", nama: "Ketahanan", penerangan: {
    rendah: "Mudah letih dan menyerah kalah bila berdepan tekanan.",
    sederhana: "Mempunyai ketahanan pada tahap sederhana.",
    tinggi: "Sangat tekun dan tabah menghadapi cabaran fizikal dan mental.",
  } },
];

function interpretasiTahap(score: number): { label: "Rendah" | "Sederhana" | "Tinggi"; color: string; barColor: string } {
  if (score >= 70) return { label: "Tinggi", color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900", barColor: "bg-emerald-500" };
  if (score >= 40) return { label: "Sederhana", color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900", barColor: "bg-amber-500" };
  return { label: "Rendah", color: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-900", barColor: "bg-rose-500" };
}

export function PsikometrikSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Sila masukkan nombor pengenalan.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/psikometrik?noPengenalan=${encodeURIComponent(trimmed)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Gagal mendapatkan keputusan");
      setResult(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ralat tidak diketahui");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="border border-emerald-500/50 bg-card rounded-lg overflow-hidden">
        <div className="flex flex-col items-center gap-4 border-b border-border/60 bg-muted/20 px-6 py-6">
          <div className="flex items-center gap-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gallery/sekolah/jata-negara.png" alt="Kementerian Pendidikan" className="h-16 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Kementerian Pendidikan Malaysia</p>
              <h1 className="mt-1 font-heading text-lg font-bold tracking-tight md:text-xl">PELAPORAN PENTAKSIRAN PSIKOMETRIK</h1>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo Sekolah" className="h-16 w-auto object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Masukkan No. Pengenalan Diri"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 pl-10 pr-24 rounded-full text-center tracking-wide"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-9 rounded-full"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </Button>
            </div>
          </form>
        </div>

        {/* Body */}
        {!result && !error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="size-6" />
            </div>
            <h2 className="font-heading text-base font-semibold">Semak keputusan pentaksiran anda</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Masukkan nombor pengenalan diri (contoh: <span className="font-mono">090310101950</span>) untuk melihat keputusan pentaksiran psikometrik individu.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm">Mencari keputusan…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="font-heading text-base font-semibold">Keputusan tidak dijumpai</h2>
            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {result && !loading && <ResultView result={result} />}
      </div>
    </div>
  );
}

type TahapFilter = "semua" | "Tinggi" | "Sederhana" | "Rendah";

const FILTER_OPTIONS: Array<{ value: TahapFilter; label: string; dotClass: string; activeClass: string }> = [
  { value: "semua", label: "Semua", dotClass: "bg-foreground/50", activeClass: "bg-foreground text-background" },
  { value: "Tinggi", label: "Tinggi", dotClass: "bg-emerald-500", activeClass: "bg-emerald-500 text-white" },
  { value: "Sederhana", label: "Sederhana", dotClass: "bg-amber-500", activeClass: "bg-amber-500 text-white" },
  { value: "Rendah", label: "Rendah", dotClass: "bg-rose-500", activeClass: "bg-rose-500 text-white" },
];

function ResultView({ result }: { result: Result }) {
  const [filter, setFilter] = useState<TahapFilter>("semua");
  const [chartRevealed, setChartRevealed] = useState(false);
  const [gridRevealed, setGridRevealed] = useState(false);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const targets: Array<[HTMLElement | null, () => void]> = [
      [chartRef.current, () => setChartRevealed(true)],
      [gridRef.current, () => setGridRevealed(true)],
    ];
    const observers = targets
      .filter((t): t is [HTMLElement, () => void] => t[0] !== null)
      .map(([el, cb]) => {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              cb();
              io.disconnect();
            }
          },
          { threshold: 0.15 },
        );
        io.observe(el);
        return io;
      });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const items = useMemo(
    () =>
      CONSTRUCTS.map((c) => {
        const score = Number(result.scores[c.code] ?? 0);
        const tahap = interpretasiTahap(score);
        return { c, score, tahap };
      }),
    [result],
  );

  const filteredItems = useMemo(
    () => (filter === "semua" ? items : items.filter((i) => i.tahap.label === filter)),
    [items, filter],
  );

  const counts = useMemo(() => ({
    Tinggi: items.filter((i) => i.tahap.label === "Tinggi").length,
    Sederhana: items.filter((i) => i.tahap.label === "Sederhana").length,
    Rendah: items.filter((i) => i.tahap.label === "Rendah").length,
  }), [items]);

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Student info */}
      <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
        <InfoRow icon={<User className="size-3.5" />} label="Nama Murid" value={result.namaMurid} />
        <InfoRow icon={<GraduationCap className="size-3.5" />} label="No. Pengenalan" value={result.noPengenalan} mono />
        <InfoRow icon={<School className="size-3.5" />} label="Sekolah" value={result.namaSekolah || "-"} />
        <InfoRow icon={<Calendar className="size-3.5" />} label="Tarikh" value={result.tarikh || "-"} />
        <InfoRow icon={<School className="size-3.5" />} label="Kod Sekolah" value={result.kodSekolah || "-"} mono />
        <InfoRow icon={<GraduationCap className="size-3.5" />} label="Kelas" value={result.namaKelas || "-"} />
      </div>

      {/* Filter tahap */}
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 pr-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="size-3" /> Tapis Tahap
        </span>
        {FILTER_OPTIONS.map((opt) => {
          const isActive = filter === opt.value;
          const count = opt.value === "semua" ? items.length : counts[opt.value];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? opt.activeClass + " shadow-sm"
                  : "border-border/60 bg-background text-foreground/70 hover:text-foreground hover:bg-muted",
              )}
            >
              <span className={cn("size-1.5 rounded-full", isActive ? "bg-white/80" : opt.dotClass)} />
              {opt.label}
              <span className={cn("tabular-nums", isActive ? "text-white/85" : "text-muted-foreground")}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Score chart */}
      <div ref={chartRef} className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Skor Inventori Tret Personaliti (ITP)</h2>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden md:inline-flex">
            <Printer className="size-3.5" /> Cetak
          </Button>
        </div>
        <div className="mt-3 space-y-2 rounded-md border border-border/60 bg-card p-4">
          {filteredItems.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Tiada konstruk dalam tahap ini.</p>
          ) : (
            filteredItems.map((item, i) => {
              const revealDelay = i * 90;
              const width = chartRevealed ? Math.min(100, Math.max(0, item.score)) : 0;
              return (
                <div
                  key={item.c.code}
                  className={cn(
                    "grid grid-cols-[80px_1fr_60px] items-center gap-3 sm:grid-cols-[110px_1fr_80px] transition-all duration-500 ease-out",
                    chartRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                  )}
                  style={{ transitionDelay: `${revealDelay}ms` }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide">{item.c.nama}</p>
                    <p className="text-[10px] text-muted-foreground">{item.c.code}</p>
                  </div>
                  <div className="h-6 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full ease-out", item.tahap.barColor)}
                      style={{
                        width: `${width}%`,
                        transition: `width 900ms ease-out ${revealDelay + 100}ms`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="tabular-nums text-sm font-semibold">{item.score}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><span className="size-2 rounded-full bg-rose-500" /> Rendah &lt; 40%</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"><span className="size-2 rounded-full bg-amber-500" /> Sederhana 40–69%</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><span className="size-2 rounded-full bg-emerald-500" /> Tinggi ≥ 70%</span>
        </div>
      </div>

      {/* Construct interpretation */}
      <div ref={gridRef} className="mt-6">
        <h2 className="font-heading text-base font-semibold">Interpretasi Konstruk</h2>
        <p className="text-xs text-muted-foreground">Penerangan tret personaliti berdasarkan skor anda.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {filteredItems.length === 0 ? (
            <p className="col-span-full py-6 text-center text-xs text-muted-foreground">Tiada konstruk dalam tahap ini.</p>
          ) : (
            filteredItems.map((item, i) => {
              const teks = item.tahap.label === "Tinggi" ? item.c.penerangan.tinggi : item.tahap.label === "Sederhana" ? item.c.penerangan.sederhana : item.c.penerangan.rendah;
              return (
                <div
                  key={item.c.code}
                  className={cn(
                    "rounded-md border border-border/60 bg-card p-4 transition-all duration-500 ease-out",
                    gridRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                  )}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-sm font-semibold uppercase">{item.c.nama}</h3>
                    <Badge variant="outline" className={cn("text-[10px]", item.tahap.color)}>{item.tahap.label} · {item.score}%</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{teks}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={cn("truncate text-sm font-medium", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}
