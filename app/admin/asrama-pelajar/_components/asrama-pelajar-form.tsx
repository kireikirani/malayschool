"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { createAsramaPelajarSchema } from "@/lib/validations/asrama-pelajar.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";

type Values = z.input<typeof createAsramaPelajarSchema>;

export function AsramaPelajarForm({
  pelajarId,
  initialData,
}: {
  pelajarId?: number;
  initialData?: Partial<Values>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(createAsramaPelajarSchema),
    defaultValues: {
      jantina: initialData?.jantina ?? "lelaki",
      nama: initialData?.nama ?? "",
      tingkatan: initialData?.tingkatan ?? "",
      dorm: initialData?.dorm ?? "",
      namaWaris: initialData?.namaWaris ?? "",
      noWaris: initialData?.noWaris ?? "",
      foto: initialData?.foto ?? undefined,
      status: initialData?.status ?? "active",
    },
  });

  async function onSubmit(values: Values) {
    setIsSubmitting(true);
    try {
      const url = pelajarId ? `/api/asrama-pelajar/${pelajarId}` : "/api/asrama-pelajar";
      const method = pelajarId ? "PATCH" : "POST";
      await apiSend(url, method, values);
      toast.success(pelajarId ? "Data dikemaskini" : "Pelajar ditambah");
      router.push("/admin/asrama-pelajar");
      router.refresh();
    } catch (err: unknown) {
      if (!setFormErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Ralat berlaku");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        <FormField
          control={form.control}
          name="foto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto Pelajar</FormLabel>
              <FormControl>
                <ImagePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jantina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jantina *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lelaki">Lelaki (Aspura)</SelectItem>
                  <SelectItem value="perempuan">Perempuan (Aspuri)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Penuh *</FormLabel>
              <FormControl>
                <Input placeholder="Nama penuh pelajar..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tingkatan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tingkatan *</FormLabel>
                <FormControl>
                  <Input placeholder="4A, 5B..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dorm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dorm / Bilik *</FormLabel>
                <FormControl>
                  <Input placeholder="Blok A — Bilik 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="namaWaris"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Waris</FormLabel>
                <FormControl>
                  <Input placeholder="Nama ibu/bapa..." {...field} value={(field.value as string) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noWaris"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telefon Waris</FormLabel>
                <FormControl>
                  <Input placeholder="0123456789" {...field} value={(field.value as string) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif (Masih dalam asrama)</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif (Keluar asrama)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : pelajarId ? "Kemaskini" : "Tambah Pelajar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
