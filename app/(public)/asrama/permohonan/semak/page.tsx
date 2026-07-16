"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, Calendar, User, Phone, Clipboard, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PermohonanRecord = {
  id: number;
  namaPelajar: string;
  tingkatan: string;
  dorm: string;
  jenis: "pulang_bermalam" | "outing" | "mc_sakit";
  tarikhKeluar: string;
  tarikhPulang: string | null;
  sebab: string;
  status: "menunggu" | "diluluskan" | "ditolak" | "mc";
  diluluskanOleh: string | null;
  tarikhKelulusan: string | null;
  catatan: string | null;
  pengambil: string | null;
  noPendaftaran: string | null;
  guardNama: string | null;
  tarikhDiambil: string | null;
  createdAt: string;
};

function SemakStatusContent() {
  const searchParams = useSearchParams();
  const [noWaris, setNoWaris] = useState("");
  const [records, setRecords] = useState<PermohonanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filter, setFilter] = useState<"semua" | "menunggu" | "diluluskan" | "mc" | "ditolak">("semua");

  const queryNoWaris = searchParams.get("noWaris");

  async function fetchStatus(warisPhone: string) {
    if (!warisPhone) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/permohonan?noWaris=${encodeURIComponent(warisPhone)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Gagal memuat status");
      setRecords(body.data);
      setHasSearched(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ralat memuat status");
    } finally {
      setLoading(false);
    }
  }

  // Auto-search if noWaris is in query parameters
  useEffect(() => {
    if (queryNoWaris) {
      setNoWaris(queryNoWaris);
      fetchStatus(queryNoWaris);
    }
  }, [queryNoWaris]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!noWaris.trim()) {
      toast.error("Sila masukkan nombor telefon waris");
      return;
    }
    fetchStatus(noWaris.trim());
  }

  const filteredRecords = records.filter((r) => {
    if (filter === "semua") return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: PermohonanRecord["status"]) => {
    switch (status) {
      case "menunggu":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Menunggu Kelulusan</Badge>;
      case "diluluskan":
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Diluluskan</Badge>;
      case "ditolak":
        return <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-200">Ditolak</Badge>;
      case "mc":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Rekod MC / Sakit</Badge>;
    }
  };

  const getJenisLabel = (jenis: PermohonanRecord["jenis"]) => {
    switch (jenis) {
      case "pulang_bermalam": return "Pulang Bermalam";
      case "outing": return "Outing";
      case "mc_sakit": return "MC / Sakit";
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Semak Status Permohonan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Masukkan nombor telefon waris yang didaftarkan semasa memohon untuk menyemak keputusan.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-8 border border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Masukkan No. Telefon Waris (contoh: 0123456789)"
                value={noWaris}
                onChange={(e) => setNoWaris(e.target.value)}
                className="pl-9 bg-background"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <RefreshCw className="size-4 animate-spin" /> : <Search className="size-4" />}
              <span className="hidden sm:inline ml-2">Semak</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b pb-2">
            {(["semua", "menunggu", "diluluskan", "mc", "ditolak"] as const).map((tab) => {
              const count = records.filter(r => tab === "semua" ? true : r.status === tab).length;
              return (
                <Button
                  key={tab}
                  variant={filter === tab ? "default" : "ghost"}
                  size="sm"
                  className="capitalize"
                  onClick={() => setFilter(tab)}
                >
                  {tab === "mc" ? "MC / Sakit" : tab}
                  <span className="ml-1.5 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-xs font-semibold">
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Cards List */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card border rounded-lg p-6">
              <Clipboard className="mx-auto size-8 text-muted-foreground/60 mb-3" />
              <p className="font-medium">Tiada permohonan ditemui</p>
              <p className="text-sm text-muted-foreground mt-1">Sila pastikan penapisan status atau nombor telefon adalah betul.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((item) => (
                <Card key={item.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-bold">{item.namaPelajar}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {item.tingkatan} • Dorm {item.dorm}
                        </CardDescription>
                      </div>
                      <div>{getStatusBadge(item.status)}</div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    {/* Form Fields */}
                    <div className="grid gap-3 sm:grid-cols-2 text-sm bg-muted/30 p-3 rounded-lg border">
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">Jenis Keluar</span>
                        <span className="font-semibold text-foreground">{getJenisLabel(item.jenis)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">Sebab</span>
                        <span className="text-foreground">{item.sebab}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">Tarikh Keluar</span>
                        <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          {formatDate(item.tarikhKeluar)}
                        </span>
                      </div>
                      {item.jenis !== "mc_sakit" && (
                        <div>
                          <span className="text-xs text-muted-foreground block font-medium">Tarikh Pulang</span>
                          <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                            <Calendar className="size-3.5 text-muted-foreground" />
                            {formatDate(item.tarikhPulang)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Kelulusan Section */}
                    {(item.status === "diluluskan" || item.status === "ditolak" || item.status === "mc") && (
                      <div className="border-t pt-3 space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Maklumat Kelulusan Warden</h4>
                        <div className="text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <span className="text-xs text-muted-foreground block">Warden Meluluskan</span>
                              <span className="font-medium flex items-center gap-1.5 mt-0.5">
                                <User className="size-3.5 text-muted-foreground" />
                                {item.diluluskanOleh || "Pihak Pentadbir"}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">Tarikh Kelulusan</span>
                              <span className="font-medium mt-0.5 block">{formatDateTime(item.tarikhKelulusan)}</span>
                            </div>
                          </div>
                          {item.catatan && (
                            <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                              <span className="text-xs text-muted-foreground block">Catatan / Komen</span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{item.catatan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Perekodan Pengambilan (Guard/Satpam) */}
                    {(item.status === "diluluskan" || item.status === "mc") && (
                      <div className="border-t pt-3 space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rekod Pengambilan Asrama (Satpam)</h4>
                        {item.tarikhDiambil ? (
                          <div className="text-sm bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold mb-2">
                              <CheckCircle2 className="size-4 shrink-0" />
                              <span>✅ TELAH DIAMBIL</span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 text-xs">
                              <div>
                                <span className="text-muted-foreground block">Pengambil (Ibu Bapa / Waris)</span>
                                <span className="font-bold text-foreground">{item.pengambil}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">No. Plat Kenderaan</span>
                                <span className="font-bold text-foreground">{item.noPendaftaran}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Masa Keluar</span>
                                <span className="font-medium text-foreground">{formatDateTime(item.tarikhDiambil)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Direkod Oleh</span>
                                <span className="font-medium text-foreground flex items-center gap-1">
                                  <ShieldCheck className="size-3 text-muted-foreground" />
                                  {item.guardNama || "Pengawal Bertugas"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20 flex gap-2">
                            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-amber-900 dark:text-amber-400">Belum Diambil</p>
                              <p className="text-xs text-amber-800 dark:text-amber-500 mt-0.5">
                                Pelajar dibenarkan keluar. Tunjukkan permit ini kepada Pengawal Keselamatan (Satpam) semasa menjemput anak di pintu pagar asrama.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/asrama/permohonan">
            <ChevronRight className="mr-2 size-4 rotate-180" />
            Kembali ke Borang Permohonan
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function SemakStatusPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Memuatkan carian...</div>}>
      <SemakStatusContent />
    </Suspense>
  );
}
