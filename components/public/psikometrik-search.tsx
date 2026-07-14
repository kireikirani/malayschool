"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, Printer, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const CONSTRUCTS: Array<{
  code: string;
  nama: string;
  penerangan: { rendah: string; sederhana: string; tinggi: string };
}> = [
  {
    code: "AUT",
    nama: "Autonomi",
    penerangan: {
      rendah: "Kurang keupayaan bertindak secara autonomi. Bergantung pada arahan orang lain dalam membuat keputusan harian.",
      sederhana: "Mempunyai ciri-ciri autonomi pada tahap sederhana dari segi keakuran, kebebasan dan mengawal aktiviti harian. Seorang individu yang agak bebas. Anda selesa membuat keputusan sendiri dalam situasi tertentu.",
      tinggi: "Sangat autonomi. Berani buat keputusan sendiri, bebas dan berkeyakinan tinggi dalam tindakan. Anda jarang bergantung kepada orang lain dan lebih suka mengurus diri sendiri.",
    },
  },
  {
    code: "KTF",
    nama: "Kreatif",
    penerangan: {
      rendah: "Kurang cenderung kepada idea baharu dan cara berfikir yang berbeza. Lebih selesa mengikuti cara yang telah ditetapkan.",
      sederhana: "Mempunyai ciri-ciri kreatif pada tahap sederhana. TINGGI (70%-98%) Seorang yang mempunyai ciri-ciri kreatif pada tahap tinggi. Suka mencipta dan menghasilkan karya yang original dan tidak suka ikut yang berbentuk.",
      tinggi: "Sangat kreatif. Suka mencipta idea baharu, imaginatif dan menghasilkan sesuatu yang original. Anda mempunyai daya imaginasi yang tinggi dan sentiasa berfikir di luar kotak.",
    },
  },
  {
    code: "AGF",
    nama: "Agresif",
    penerangan: {
      rendah: "Cenderung lembut, mengalah dan mengelakkan konfrontasi. Lebih suka mengelak daripada berdepan masalah secara langsung.",
      sederhana: "Mempunyai ciri asertif pada tahap sederhana. Dalam kebanyakan hal, anda selesa berkongsi pendapat dan mempertahankan hak. Tidak mudah terpengaruh oleh pandangan orang lain. Dalam kebanyakan hal, anda percaya anda boleh melakukan lebih banyak perkara bagi mempertahankan diri dan nilai-nilai anda.",
      tinggi: "Sangat asertif. Berani menyuarakan pendapat dan mempertahankan hak. Anda tidak mudah mengalah dan sentiasa bersedia berdebat untuk mempertahankan pendirian.",
    },
  },
  {
    code: "EKT",
    nama: "Ekstrovet",
    penerangan: {
      rendah: "Lebih pendiam dan selesa dalam kumpulan kecil atau bersendirian. Kurang selesa dalam situasi sosial yang besar.",
      sederhana: "Mempunyai ciri ekstrovet pada tahap sederhana dalam hubungan bersama orang lain. Berpada-pada dalam mesra pergaulan. Rakan sebaya mengatakan bahawa anda boleh bergaul, rasa suka menghujat kerana keseorangan, jalan bersatu di hadapan orang ramai, suka menjaga dan hati berbentuk tetapi positif.",
      tinggi: "Sangat ekstrovet. Peramah, suka berinteraksi dan mudah mesra dengan orang lain. Anda mempunyai kemahiran sosial yang tinggi dan menikmati kehadiran dalam kumpulan besar.",
    },
  },
  {
    code: "PCP",
    nama: "Pencapaian",
    penerangan: {
      rendah: "Kurang mengejar pencapaian tinggi; selesa dengan hasil semasa. Tidak terlalu ambil berat tentang kejayaan.",
      sederhana: "Mempunyai motivasi dan pencapaian yang sederhana. Seorang yang sangat bermotivasi, sukakan kejayaan melalui persaingan dan perbandingan.",
      tinggi: "Sangat berorientasikan pencapaian. Sentiasa menetapkan matlamat dan berusaha untuk cemerlang. Anda tidak mudah berpuas hati dan sentiasa mencari peluang untuk meningkatkan diri.",
    },
  },
  {
    code: "KPG",
    nama: "Kepelbagaian",
    penerangan: {
      rendah: "Selesa dengan rutin dan kurang selesa dengan perubahan. Lebih suka persekitaran yang tetap dan boleh diramal.",
      sederhana: "Mempunyai tahap kepelbagaian yang sederhana. Seorang yang kurang berminat akan kepelbagaian. Lebih selesa melakukan kerja yang rutin dan berulang-ulang.",
      tinggi: "Sangat suka kepelbagaian dan pengalaman baharu. Kerja rutin sangat membosankan. Anda sentiasa mencari cabaran baharu dan tidak suka terperangkap dalam rutin yang sama.",
    },
  },
  {
    code: "ITL",
    nama: "Intelektual",
    penerangan: {
      rendah: "Kurang minat pada perkara berbentuk akademik atau ilmiah. Lebih suka aktiviti praktikal berbanding teori.",
      sederhana: "Mempunyai minat pada tahap sederhana pada ilmu pengetahuan, akademik dan ilmiah. TINGGI (70%-98%) Seorang yang sangat mencintai ilmu, akademik dan berfikiran mendalam dan berpelajaran.",
      tinggi: "Sangat berminat dengan ilmu, suka membaca dan mencari ilmu berterusan. Anda menikmati perbincangan intelektual dan suka mendalami pelbagai bidang ilmu.",
    },
  },
  {
    code: "KPN",
    nama: "Kepimpinan",
    penerangan: {
      rendah: "Selesa mengikut dan tidak selesa memimpin. Lebih suka bekerja dalam peranan sokongan berbanding kepimpinan.",
      sederhana: "Mempunyai ciri kepimpinan pada tahap sederhana. Hanya boleh memimpin kumpulan-kumpulan kecil. TINGGI (70%-98%) Seorang yang mempunyai ciri-ciri kepimpinan yang tinggi. Anda boleh memimpin jika diperlukan dan mempunyai keupayaan dan daya pengaruh yang tinggi dan boleh mempengaruhi orang lain.",
      tinggi: "Sangat berupaya memimpin, tegas, tidak takut membuat keputusan dan suka menjadi ketua. Anda mampu mempengaruhi orang lain dan menggerakkan pasukan ke arah matlamat yang ditetapkan.",
    },
  },
  {
    code: "STR",
    nama: "Struktur",
    penerangan: {
      rendah: "Lebih fleksibel dan selesa dengan kerja tanpa struktur. Tidak terlalu mementingkan peraturan dan prosedur.",
      sederhana: "Mempunyai ciri personaliti struktur pada tahap sederhana. Seorang individu yang suka kepada keteraturan, kerapian dan keselesaan perkara secara berterusan, suka merancang hal kehidupan dan kerjaya dan sentiasa merancang kerja yang mementingkan ketelitian, peralatan, ketelitian dan berulung-ulang.",
      tinggi: "Sangat sistematik. Suka kepada peraturan, susunan dan kestabilan. Anda mementingkan ketepatan, kesempurnaan dan memastikan segala-galanya dilakukan dengan betul mengikut prosedur.",
    },
  },
  {
    code: "RSL",
    nama: "Resilien",
    penerangan: {
      rendah: "Mudah terkesan dengan cabaran dan tekanan. Memerlukan masa yang lama untuk pulih daripada kekecewaan.",
      sederhana: "Mempunyai ciri ketahanan psikologi pada tahap sederhana. TINGGI (75%-98%) Seorang yang mempunyai daya tahan yang tinggi dan emosi serta akan sentiasa mampu serta menghadapi situasi-situasi yang pantas yang diberikan (Semangat yang tinggi, berjaya keras, azam tinggi, Akhiar bersungguh-sungguh, dan berjuang untuk-kan).",
      tinggi: "Sangat tabah dan cekal. Mampu bangkit semula daripada kegagalan. Anda mempunyai ketahanan mental yang tinggi dan tidak mudah putus asa walaupun menghadapi cabaran yang berat.",
    },
  },
  {
    code: "MLG",
    nama: "Menolong",
    penerangan: {
      rendah: "Kurang cenderung untuk menolong secara aktif. Lebih mengutamakan keperluan diri sendiri berbanding orang lain.",
      sederhana: "Mempunyai ciri menolong pada tahap sederhana. (Simpati dan penglibatan dalam aktiviti kepada di tahap sederhana) TINGGI (70%-98%) Seorang yang mempunyai sifat empati yang tinggi, prihatin, peka, mudah menghulurkan bantuan secara sukarela.",
      tinggi: "Sangat prihatin, peka, mudah menghulurkan bantuan secara sukarela. Anda mempunyai sifat empati yang tinggi dan sentiasa bersedia membantu orang lain tanpa mengharapkan balasan.",
    },
  },
  {
    code: "ATL",
    nama: "Analitikal",
    penerangan: {
      rendah: "Kurang teliti dalam menganalisis, cenderung membuat keputusan berdasarkan perasaan daripada fakta.",
      sederhana: "Mempunyai ciri analitikal pada tahap sederhana. Seorang yang suka kepada fakta dan pemikiran secara analitikal adalah sederhana. TINGGI (70%-98%) Seorang yang peka kepada pemikiran dan pemerhati dalam hal-hal yang tidak mudah diperhatikan, suka menganalisis dan berdasarkan faktor.",
      tinggi: "Sangat teliti, kritis dan analitis. Suka mengkaji sesuatu secara mendalam. Anda membuat keputusan berdasarkan data dan bukti, dan suka memahami punca sesuatu masalah sebelum bertindak.",
    },
  },
  {
    code: "KD",
    nama: "Kritik Diri",
    penerangan: {
      rendah: "Kurang peka terhadap kesalahan diri. Jarang mengkritik diri sendiri dan mudah berpuas hati.",
      sederhana: "Mempunyai ciri kritik diri pada tahap sederhana. (Tahu satu cita peka & kritikan). TINGGI (75%-99%) Seorang yang sangat peka terhadap aspek moral dan psikologi sendiri. Seorang yang suka memeriksa di kiri, kenal pasti kekuatan & kelemahan serta sentimen sentiasa memperbaiki diri. Anda berkeyakinan bahawa anda adalah salah melebihi 50% dicsebabkan banyaknya yang dilakukan. Individu yang mendapat skor melebihi 50% dicadangkan berjumpa guru kaunseling.",
      tinggi: "Sangat kritikal terhadap diri sendiri, cepat mengaku silap dan sentiasa memperbaiki diri. Anda sentiasa menilai tindakan sendiri dan berusaha untuk menjadi lebih baik. Individu yang mendapat skor melebihi 50% dicadangkan berjumpa guru kaunseling.",
    },
  },
  {
    code: "WSN",
    nama: "Wawasan",
    penerangan: {
      rendah: "Kurang memikirkan masa depan secara jauh. Lebih fokus pada masa kini daripada merancang jangka panjang.",
      sederhana: "Mempunyai wawasan pada tahap sederhana. (Matlamat dan objektif setakat ada sahaja, tiada enthusiasm). Anda individu biasa-biasa yang tidak mempunyai daya imaginasi dan cita-cita yang tinggi. Anda mempunyai hala tuju, visi dan misi yang agak jelas. (Saya yang membentangkan pandangan masa. Anda mempunyai hala tuju, visi dan misi yang agak jelas).",
      tinggi: "Sangat berwawasan, mempunyai hala tuju dan visi masa depan yang jelas. Anda mampu merancang dengan teliti untuk jangka masa panjang dan sentiasa bermotivasi untuk mencapai impian.",
    },
  },
  {
    code: "KTN",
    nama: "Ketahanan",
    penerangan: {
      rendah: "Mudah letih dan menyerah kalah bila berdepan tekanan. Memerlukan masa rehat yang kerap untuk pulih.",
      sederhana: "Mempunyai ketahanan pada tahap sederhana. Seorang yang sederhana mempunyai ketahanan dalam menghadapi rasa penat.",
      tinggi: "Sangat tekun dan tabah menghadapi cabaran fizikal dan mental. Anda boleh bekerja dalam waktu yang lama tanpa mudah menyerah, dan sentiasa bermotivasi walaupun dalam keadaan tertekan.",
    },
  },
];

function interpretasiTahap(score: number): {
  label: "Rendah" | "Sederhana" | "Tinggi";
  range: string;
  cellClass: string;
} {
  if (score >= 70)
    return { label: "Tinggi", range: "70% hingga 99%", cellClass: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" };
  if (score >= 40)
    return { label: "Sederhana", range: "40% hingga 69%", cellClass: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" };
  return { label: "Rendah", range: "1% hingga 39%", cellClass: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" };
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
    <div className="mx-auto max-w-7xl px-4 py-10 print:py-0 print:px-0">
      <div className="border border-border/70 bg-card shadow-sm print:border-black print:shadow-none">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="border-b border-border/70 px-6 py-5 print:border-black">
          <div className="flex items-center justify-between gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gallery/sekolah/jata-negara.png"
                alt="Jata Negara"
                className="h-16 w-auto object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground print:text-black">
                Kementerian Pendidikan Malaysia
              </p>
              <h1 className="mt-1 font-heading text-base font-bold tracking-tight md:text-lg print:text-xl">
                PELAPORAN PENTAKSIRAN PSIKOMETRIK
              </h1>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.png"
              alt="Logo Sekolah"
              className="h-16 w-auto shrink-0 object-contain"
            />
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-5 flex justify-center print:hidden">
            <div className="relative w-full max-w-sm">
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Masukkan No. Pengenalan Diri"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-full pr-12 text-center tracking-widest"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading}
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-full"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Body states ──────────────────────────────────────────────────── */}
        {!result && !error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="size-6" />
            </div>
            <h2 className="font-heading text-base font-semibold">Semak keputusan pentaksiran anda</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Masukkan nombor pengenalan diri (contoh:{" "}
              <span className="font-mono">090310101950</span>) untuk melihat keputusan pentaksiran psikometrik individu.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm">Mencari keputusan…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="font-heading text-base font-semibold">Keputusan tidak dijumpai</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {result && !loading && <ResultView result={result} />}
      </div>
    </div>
  );
}

function ResultView({ result }: { result: Result }) {
  const items = CONSTRUCTS.map((c) => {
    const score = Number(result.scores[c.code] ?? 0);
    const tahap = interpretasiTahap(score);
    const penerangan =
      tahap.label === "Tinggi"
        ? c.penerangan.tinggi
        : tahap.label === "Sederhana"
          ? c.penerangan.sederhana
          : c.penerangan.rendah;
    return { c, score, tahap, penerangan };
  });

  return (
    <div className="divide-y divide-border/60 print:divide-black/20">
      {/* ── Student info ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        <dl className="space-y-1.5 text-sm">
          {[
            { label: "NAMA MURID", value: result.namaMurid },
            { label: "NO. PENGENALAN DIRI", value: result.noPengenalan },
            { label: "KOD SEKOLAH", value: result.kodSekolah || "-" },
            { label: "NAMA SEKOLAH", value: result.namaSekolah || "-" },
            { label: "NAMA KELAS", value: result.namaKelas || "-" },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <dt className="w-52 shrink-0 font-semibold uppercase text-foreground/70 print:text-black">
                {label}
              </dt>
              <dd className="flex gap-2">
                <span className="text-muted-foreground print:text-black">:</span>
                <span className="font-medium print:text-black">{value}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Score table ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
            Skor Keputusan Inventori Tret Personaliti (ITP)
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden gap-1.5 text-xs md:inline-flex print:hidden"
          >
            <Printer className="size-3.5" />
            Cetak Laporan
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center text-xs">
            <thead>
              <tr className="border border-border/70 bg-muted/50 print:border-black print:bg-gray-100">
                <th className="border border-border/70 px-3 py-2 font-semibold uppercase print:border-black">
                  Tarikh
                </th>
                {CONSTRUCTS.map((c) => (
                  <th
                    key={c.code}
                    className="border border-border/70 px-2 py-2 font-semibold uppercase print:border-black"
                  >
                    {c.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border border-border/70 print:border-black">
                <td className="border border-border/70 px-3 py-2 text-muted-foreground print:border-black print:text-black">
                  {result.tarikh || "-"}
                </td>
                {items.map(({ c, score, tahap }) => (
                  <td
                    key={c.code}
                    className={cn(
                      "border border-border/70 px-2 py-2 font-semibold print:border-black print:bg-transparent print:text-black",
                      tahap.cellClass,
                    )}
                  >
                    {score}&nbsp;%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Interpretasi + Construct details ─────────────────────────────── */}
      <div className="grid gap-0 md:grid-cols-[260px_1fr] print:grid-cols-[220px_1fr]">
        {/* Left: interpretasi legend */}
        <div className="border-b border-border/60 px-6 py-4 md:border-b-0 md:border-r print:border-black">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide">Interpretasi Skor</h3>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 print:bg-gray-100">
                <th className="border border-border/70 px-3 py-1.5 text-left font-semibold uppercase print:border-black">
                  Interpretasi Skor
                </th>
                <th className="border border-border/70 px-3 py-1.5 text-left font-semibold uppercase print:border-black">
                  Skor Dalam Peratus
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Tinggi", range: "70% hingga 99%", cls: "text-emerald-700 dark:text-emerald-400" },
                { label: "Sederhana", range: "40% hingga 69%", cls: "text-amber-700 dark:text-amber-400" },
                { label: "Rendah", range: "1% hingga 39%", cls: "text-rose-700 dark:text-rose-400" },
              ].map(({ label, range, cls }) => (
                <tr key={label}>
                  <td className={cn("border border-border/70 px-3 py-1.5 font-semibold print:border-black print:text-black", cls)}>
                    {label}
                  </td>
                  <td className="border border-border/70 px-3 py-1.5 text-muted-foreground print:border-black print:text-black">
                    {range}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: construct penerangan */}
        <div className="px-6 py-4">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wide">Konstruk ITP &amp; Penerangan</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 print:bg-gray-100">
                  <th className="border border-border/70 px-3 py-1.5 text-left font-semibold uppercase print:border-black">
                    Konstruk ITP
                  </th>
                  <th className="border border-border/70 px-3 py-1.5 text-left font-semibold uppercase print:border-black">
                    Penerangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ c, score, tahap, penerangan }) => (
                  <tr key={c.code} className="align-top">
                    <td className="border border-border/70 px-3 py-2 print:border-black">
                      <p className="font-semibold uppercase">{c.nama}</p>
                    </td>
                    <td className="border border-border/70 px-3 py-2 leading-relaxed text-muted-foreground print:border-black print:text-black">
                      <span className={cn("mr-1 font-semibold not-italic print:text-black", tahap.cellClass.split(" ")[1])}>
                        {tahap.label.toUpperCase()} ({score}%)
                      </span>
                      {penerangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
