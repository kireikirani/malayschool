"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ClipboardList, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Permohonan = {
  id: number;
  namaPelajar: string;
  tingkatan: string;
  dorm: string;
  jenis: string;
  tarikhKeluar: string;
  tarikhPulang: string | null;
  sebab: string;
  status: string;
  platKenderaan: string | null;
  pengambil: string | null;
  noPendaftaran: string | null;
  tarikhDiambil: string | null;
};

const STATUS_TABS = [
  { value: "all", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "diluluskan", label: "Diluluskan" },
  { value: "ditolak", label: "Ditolak" },
  { value: "mc", label: "MC" },
] as const;

export default function GuardPermohonanPage() {
  const [rows, setRows] = useState<Permohonan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function fetchAll() {
    setIsLoading(true);
    try {
      const guardRes = await fetch("/api/permohonan/guard?q=");
      const guardBody = await guardRes.json();
      if (guardRes.ok && guardBody.data?.rows) {
        setRows(guardBody.data.rows);
      }
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter(
      (r) =>
        (statusFilter === "all" || r.status === statusFilter) &&
        (!q || r.namaPelajar.toLowerCase().includes(q) || r.dorm.toLowerCase().includes(q))
    );
  }, [rows, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "diluluskan":
        return <Badge variant="default" className="bg-emerald-600">Diluluskan</Badge>;
      case "ditolak":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "mc":
        return <Badge variant="secondary">MC</Badge>;
      default:
        return <Badge variant="outline">Menunggu</Badge>;
    }
  };

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case "pulang_bermalam":
        return <Badge variant="secondary">Pulang Bermalam</Badge>;
      case "outing":
        return <Badge variant="outline">Outing</Badge>;
      case "mc_sakit":
        return <Badge variant="destructive">MC / Sakit</Badge>;
      default:
        return <Badge variant="outline">{jenis}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Permohonan Keluar</h1>
        <p className="text-sm text-muted-foreground">Senarai semua permohonan keluar pelajar asrama.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Cari nama pelajar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-md border bg-muted/40 p-0.5">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={statusFilter === tab.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <RefreshCw className="mx-auto size-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Memuatkan data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
          <ClipboardList className="mx-auto size-10 text-muted-foreground/50 mb-3" />
          <p className="font-semibold text-muted-foreground">Tiada permohonan dijumpai</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((item) => (
            <Card key={item.id} className="border border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold">{item.namaPelajar}</CardTitle>
                    <CardDescription className="text-xs">
                      {item.tingkatan} • Dorm {item.dorm}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1.5">
                    {getJenisBadge(item.jenis)}
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-muted/40 p-2.5 rounded border space-y-1">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Sebab:</strong> {item.sebab}
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Tarikh Keluar:</strong> {formatDate(item.tarikhKeluar)}
                  </p>
                  {item.platKenderaan && (
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Plat:</strong>{" "}
                      <span className="font-mono font-semibold text-foreground">{item.platKenderaan}</span>
                    </p>
                  )}
                </div>
                {item.tarikhDiambil && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-2.5 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      <span>Telah Diambil</span>
                    </div>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Pengambil:</strong> {item.pengambil}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Plat:</strong> {item.noPendaftaran}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
