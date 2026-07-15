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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { createAlbumSchema } from "@/lib/validations/gallery.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";

type AlbumFormValues = z.input<typeof createAlbumSchema>;

export function AlbumForm({
  albumId,
  initialData,
}: {
  albumId?: string;
  initialData?: Partial<AlbumFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(createAlbumSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      coverImage: initialData?.coverImage ?? undefined,
      tarikh: initialData?.tarikh ?? "",
      linkGdrive: initialData?.linkGdrive ?? "",
    },
  });

  async function onSubmit(values: AlbumFormValues) {
    setIsSubmitting(true);
    try {
      if (albumId) {
        await apiSend(`/api/gallery/albums/${albumId}`, "PATCH", values);
        toast.success("Album diperbarui");
      } else {
        await apiSend("/api/gallery/albums", "POST", values);
        toast.success("Album dibuat");
      }
      router.push("/admin/gallery");
    } catch (err) {
      if (!setFormErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan album");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem data-tour="gallery-form-title">
              <FormLabel>Tajuk / Program</FormLabel>
              <FormControl>
                <Input placeholder="cth: Hari Sukan 2025" {...field} />
              </FormControl>
              <FormDescription>Nama program atau tajuk acara yang akan dipaparkan di galeri.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4" data-tour="gallery-form-schedule">
          <FormField
            control={form.control}
            name="tarikh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarikh</FormLabel>
                <FormControl>
                  <Input placeholder="15 Julai 2025" {...field} value={(field.value as string) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkGdrive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Google Drive</FormLabel>
                <FormControl>
                  <Input placeholder="https://drive.google.com/..." {...field} value={(field.value as string) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value as string} />
              </FormControl>
              <FormDescription>Keterangan ringkas (opsional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem data-tour="gallery-form-cover">
              <FormLabel>Sampul Album</FormLabel>
              <FormControl>
                <ImagePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>Gambar utama yang mewakili album ini dalam senarai galeri.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} data-tour="gallery-form-submit">
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}
