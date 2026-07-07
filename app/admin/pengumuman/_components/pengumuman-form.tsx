"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { PageTour } from "@/components/admin/tour/page-tour";
import { pengumumanFormSteps } from "@/components/admin/tour/tour-steps";
import { createPengumumanSchema } from "@/lib/validations/pengumuman.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";

type Values = z.input<typeof createPengumumanSchema>;

export function PengumumanForm({
  pengumumanId,
  initialData,
}: {
  pengumumanId?: number;
  initialData?: Partial<Values>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(createPengumumanSchema),
    defaultValues: {
      tajuk: initialData?.tajuk ?? "",
      deskripsi: initialData?.deskripsi ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      linkUrl: initialData?.linkUrl ?? "",
      aktif: initialData?.aktif ?? true,
      tamatPada: initialData?.tamatPada ?? "",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: Values) {
    setIsSubmitting(true);
    try {
      const url = pengumumanId ? `/api/pengumuman/${pengumumanId}` : "/api/pengumuman";
      const method = pengumumanId ? "PATCH" : "POST";
      await apiSend(url, method, values);
      toast.success(pengumumanId ? "Pengumuman dikemaskini" : "Pengumuman ditambah");
      router.push("/admin/pengumuman");
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
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <PageTour tourKey="pengumuman-form" steps={pengumumanFormSteps} />
      </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div data-tour="pengumuman-form-poster">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gambar / Poster *</FormLabel>
                <FormControl>
                  <ImagePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tajuk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tajuk *</FormLabel>
              <FormControl>
                <Input placeholder="Tajuk pengumuman..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Keterangan ringkas..." rows={3} {...field} value={(field.value as string) ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linkUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Pautan</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>Kosongkan jika tiada pautan</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div data-tour="pengumuman-form-tamat" className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tamatPada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarikh Tamat</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Kosongkan jika tiada tarikh tamat</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={(field.value as number) ?? 0} />
                </FormControl>
                <FormDescription>Nombor kecil dipaparkan dahulu</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div data-tour="pengumuman-form-aktif">
          <FormField
            control={form.control}
            name="aktif"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div>
                <FormLabel>Aktif</FormLabel>
                <FormDescription>Paparkan pengumuman ini di laman utama</FormDescription>
              </div>
            </FormItem>
          )}
        />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : pengumumanId ? "Kemaskini" : "Tambah"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </Form>
    </div>
  );
}
