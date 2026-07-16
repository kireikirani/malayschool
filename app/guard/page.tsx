"use client";

import { useEffect, useState } from "react";
import { Search, ShieldAlert, CheckCircle2, Car, Clock, RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { checkoutSchema } from "@/lib/validations/asrama-permohonan.schema";
import { apiSend } from "@/lib/fetcher";

type PermohonanRow = {
  id: number;
  namaPelajar: string;
  tingkatan: string;
  dorm: string;
  jenis: "pulang_bermalam" | "outing" | "mc_sakit";
  tarikhKeluar: string;
  tarikhPulang: string | null;
  sebab: string;
  status: "menunggu" | "diluluskan" | "ditolak" | "mc";
  pengambil: string | null;
  noPendaftaran: string | null;
  tarikhDiambil: string | null;
  guardNama: string | null;
};

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function GuardDashboardPage() {
  const [search, setSearch] = useState("");
  const [counters, setCounters] = useState({ diluluskan: 0, mc: 0 });
  const [rows, setRows] = useState<PermohonanRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPermohonan, setSelectedPermohonan] = useState<PermohonanRow | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      pengambil: "",
      noPendaftaran: "",
    },
  });

  // Load counters on mount
  async function loadCounters() {
    try {
      const res = await fetch("/api/permohonan/guard");
      const body = await res.json();
      if (res.ok && body.data) {
        setCounters(body.data.counters);
      }
    } catch (err) {
      console.error("Gagal memuat kaunter:", err);
    }
  }

  useEffect(() => {
    loadCounters(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!search.trim()) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/permohonan/guard?q=${encodeURIComponent(search.trim())}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message ?? "Gagal mencari permohonan");
      setRows(body.data.rows);
      setCounters(body.data.counters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ralat melakukan carian");
    } finally {
      setIsLoading(false);
    }
  }

  function openCheckout(item: PermohonanRow) {
    setSelectedPermohonan(item);
    form.reset({
      pengambil: "",
      noPendaftaran: "",
    });
    setDialogOpen(true);
  }

  async function onCheckoutSubmit(values: CheckoutFormValues) {
    if (!selectedPermohonan) return;
    setIsSubmitLoading(true);
    try {
      await apiSend(`/api/permohonan/guard/${selectedPermohonan.id}/checkout`, "POST", values);
      toast.success("Rekod pengambilan berjaya disimpan!");
      setDialogOpen(false);
      // Refresh search and counters
      handleSearch();
      loadCounters();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal merekod pengambilan");
    } finally {
      setIsSubmitLoading(false);
    }
  }

  const getJenisBadge = (jenis: PermohonanRow["jenis"]) => {
    switch (jenis) {
      case "pulang_bermalam":
        return <Badge variant="secondary">Pulang Bermalam</Badge>;
      case "outing":
        return <Badge variant="outline">Outing</Badge>;
      case "mc_sakit":
        return <Badge variant="destructive">MC / Sakit</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Portal Pengawal Keselamatan (Satpam)</h1>
        <p className="text-sm text-muted-foreground">Merekod dan mengesahkan pelajar keluar asrama.</p>
      </div>

      {/* Counters Group */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-emerald-100 bg-emerald-50/20 dark:border-emerald-950/20 dark:bg-emerald-950/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Pelajar Diluluskan Keluar</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{counters.diluluskan}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-blue-50/20 dark:border-blue-950/20 dark:bg-blue-950/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Pelajar Sakit / MC</span>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{counters.mc}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Carian Pelajar Keluar</CardTitle>
          <CardDescription>
            Cari nama pelajar untuk mengesahkan kelulusan keluar dan merekod maklumat pengambilan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Taip nama pelajar atau tingkatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <RefreshCw className="size-4 animate-spin" /> : "Cari"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {!search.trim() ? (
          <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
            <ClipboardList className="mx-auto size-10 text-muted-foreground/50 mb-3" />
            <p className="font-semibold text-muted-foreground">Sila Taip Nama Pelajar</p>
            <p className="text-sm text-muted-foreground mt-1">
              Taip nama penuh pelajar di bar carian di atas untuk mendapatkan maklumat keluar.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <RefreshCw className="mx-auto size-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Sedang mencari data...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-card text-muted-foreground p-6">
            <ShieldAlert className="mx-auto size-10 text-muted-foreground/60 mb-3" />
            <p className="font-semibold text-foreground">Tiada permohonan ditemui atau diluluskan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mungkin permohonan pelajar masih belum diluluskan oleh warden, atau nama silap ditaip.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((item) => (
              <Card key={item.id} className="border border-border/50 shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold">{item.namaPelajar}</CardTitle>
                      <CardDescription className="text-xs">
                        {item.tingkatan} • Dorm {item.dorm}
                      </CardDescription>
                    </div>
                    {getJenisBadge(item.jenis)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-4 flex-1">
                  <div className="text-xs space-y-1.5 bg-muted/40 p-2.5 rounded border">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Sebab:</strong> {item.sebab}
                    </p>
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Tarikh Keluar:</strong> {formatDate(item.tarikhKeluar)}
                    </p>
                    {item.jenis !== "mc_sakit" && (
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Tarikh Pulang:</strong> {formatDate(item.tarikhPulang)}
                      </p>
                    )}
                  </div>

                  {item.tarikhDiambil ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>✅ TELAH DIAMBIL</span>
                      </div>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Pengambil:</strong> {item.pengambil}
                      </p>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">No. Plat Kenderaan:</strong> {item.noPendaftaran}
                      </p>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Masa Pengambilan:</strong> {formatDateTime(item.tarikhDiambil)}
                      </p>
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Direkod Oleh:</strong> {item.guardNama || "Pengawal"}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-2.5 rounded-lg text-xs">
                      <p className="font-semibold text-amber-900 dark:text-amber-400">Belum Keluar</p>
                      <p className="text-muted-foreground mt-0.5">Sila sahkan nama pemandu dan rekod pengambilan sebelum membiarkan pelajar keluar.</p>
                    </div>
                  )}
                </CardContent>

                {!item.tarikhDiambil && (
                  <div className="px-6 pb-4 border-t pt-3">
                    <Button onClick={() => openCheckout(item)} className="w-full" size="sm">
                      <Car className="mr-2 size-4" />
                      Rekod Pengambilan
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Record Checkout Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rekod Pengambilan Pelajar</DialogTitle>
          </DialogHeader>
          {selectedPermohonan && (
            <div className="mb-2 text-sm bg-muted/50 p-2.5 rounded border">
              <p><strong>Nama Pelajar:</strong> {selectedPermohonan.namaPelajar}</p>
              <p className="text-xs text-muted-foreground">Tingkatan: {selectedPermohonan.tingkatan} • Dorm: {selectedPermohonan.dorm}</p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCheckoutSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pengambil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pengambil (Ibu Bapa / Waris)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Ahmad bin Ismail" {...field} disabled={isSubmitLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noPendaftaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Pendaftaran Kenderaan (Plat)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: WXX 1234" {...field} disabled={isSubmitLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitLoading}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitLoading}>
                  {isSubmitLoading ? "Menyimpan..." : "Simpan Rekod"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
