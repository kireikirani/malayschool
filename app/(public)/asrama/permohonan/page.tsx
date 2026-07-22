"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardList, Calendar, Clock, AlertTriangle, ArrowRight, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TingkatanSelect } from "@/components/public/tingkatan-select";
import { StudentSearchInput } from "@/components/public/student-search-input";
import { createPermohonanSchema } from "@/lib/validations/asrama-permohonan.schema";
import { apiSend } from "@/lib/fetcher";

type FormValues = z.infer<typeof createPermohonanSchema>;

function BorangPermohonanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryJenis = searchParams.get("jenis");
  const [loading, setLoading] = useState(false);
  const [tingkatanFilter, setTingkatanFilter] = useState("all");

  const form = useForm<FormValues>({
    resolver: zodResolver(createPermohonanSchema),
    defaultValues: {
      nama: "",
      noWaris: "",
      emailWaris: "",
      platKenderaan: "",
      jenis: "outing",
      tarikhKeluar: "",
      tarikhPulang: "",
      sebab: "",
    },
  });

  useEffect(() => {
    if (queryJenis === "outing" || queryJenis === "pulang_bermalam" || queryJenis === "mc_sakit") {
      form.setValue("jenis", queryJenis);
    }
  }, [queryJenis, form]);

  const watchJenis = form.watch("jenis");
  const watchTarikhKeluar = form.watch("tarikhKeluar");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        tarikhPulang: values.jenis === "outing" ? values.tarikhKeluar : values.jenis === "mc_sakit" ? null : values.tarikhPulang,
      };

      await apiSend("/api/permohonan", "POST", payload);
      toast.success("Permohonan berjaya dihantar! Sila tunggu kelulusan warden.");
      
      router.push(`/asrama/permohonan/semak?noWaris=${encodeURIComponent(values.noWaris)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghantar permohonan. Semak maklumat pelajar.");
    } finally {
      setLoading(false);
    }
  }

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ClipboardList className="size-6" />
        </div>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">Borang Permohonan Keluar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mohon permit keluar harian (Outing) atau pulang bermalam untuk pelajar asrama.
        </p>
      </div>

      {/* 3 Days Notice Warning */}
      <Card className="mb-6 border-amber-200 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20">
        <CardContent className="flex gap-4 p-4">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div className="space-y-1">
            <h4 className="font-heading text-sm font-semibold text-amber-900 dark:text-amber-400">
              Notis Penting: 3 Hari Sebelum
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-500/80 leading-relaxed">
              Semua permohonan hendaklah dihantar sekurang-kurangnya **3 hari sebelum** tarikh keluar untuk memberi ruang kelulusan oleh warden bertugas.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-md">
        <CardHeader>
          <CardTitle>Maklumat Keluar</CardTitle>
          <CardDescription>
            Masukkan maklumat pelajar dan waris yang didaftarkan untuk verifikasi keselamatan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Tingkatan filter + Nama pelajar search */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-sm font-medium">Tingkatan (untapis carian)</FormLabel>
                  <TingkatanSelect
                    value={tingkatanFilter}
                    onValueChange={setTingkatanFilter}
                    placeholder="Semua Tingkatan"
                    className="mt-1.5"
                    disabled={loading}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Penuh Pelajar</FormLabel>
                      <FormControl>
                        <StudentSearchInput
                          tingkatanFilter={tingkatanFilter === "all" ? undefined : tingkatanFilter}
                          value={field.value}
                          onSelect={(student) => {
                            form.setValue("nama", student.nama);
                            if (student.noWaris) {
                              form.setValue("noWaris", student.noWaris);
                            }
                          }}
                          placeholder="Cari nama pelajar..."
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>Cari dan pilih nama pelajar dari senarai asrama.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="noWaris"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Telefon Waris</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 0123456789" {...field} disabled={loading} />
                      </FormControl>
                      <FormDescription>No. Waris berdaftar.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailWaris"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mel Waris</FormLabel>
                      <FormControl>
                        <Input placeholder="waris@email.com" type="email" {...field} disabled={loading} />
                      </FormControl>
                      <FormDescription>Untuk terima keputusan e-mel.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="platKenderaan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Plat Kenderaan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: WXX 1234" {...field} disabled={loading} className="uppercase" />
                    </FormControl>
                    <FormDescription>No. plat kenderaan yang akan mengambil pelajar. Pengawal akan mengesahkan plat ini semasa pengambilan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jenis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Keluar</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis permohonan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="outing">Outing (Keluar Sebentar & Pulang Hari Sama)</SelectItem>
                        <SelectItem value="pulang_bermalam">Pulang Bermalam</SelectItem>
                        <SelectItem value="mc_sakit">Rawatan / Sakit (MC)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tarikhKeluar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarikh Keluar</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={watchJenis === "mc_sakit" ? new Date().toISOString().split("T")[0] : getMinDate()}
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchJenis === "pulang_bermalam" && (
                  <FormField
                    control={form.control}
                    name="tarikhPulang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarikh Pulang</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={watchTarikhKeluar || getMinDate()}
                            {...field}
                            value={field.value ?? ""}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="sebab"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sebab Keluar</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Berikan alasan yang jelas (contoh: Menghadiri kenduri keluarga di Melaka)"
                        rows={3}
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between sm:items-center">
                <Button
                  asChild
                  variant="ghost"
                  className="order-last text-muted-foreground hover:text-foreground sm:order-first"
                >
                  <Link href="/asrama/permohonan/semak">
                    <UserCheck className="mr-2 size-4" />
                    Semak Status Sedia Ada
                  </Link>
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? "Menghantar..." : "Hantar Permohonan"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BorangPermohonanPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Memuatkan borang...</div>}>
      <BorangPermohonanContent />
    </Suspense>
  );
}
