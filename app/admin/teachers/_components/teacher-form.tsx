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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { createTeacherSchema } from "@/lib/validations/teacher.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";

type TeacherFormValues = z.input<typeof createTeacherSchema>;

export function TeacherForm({
  teacherId,
  initialData,
}: {
  teacherId?: string;
  initialData?: Partial<TeacherFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      position: initialData?.position ?? "",
      photo: initialData?.photo ?? undefined,
      biography: initialData?.biography ?? "",
      sortOrder: initialData?.sortOrder ?? 0,
      status: initialData?.status ?? "active",
    },
  });

  async function onSubmit(values: TeacherFormValues) {
    setIsSubmitting(true);
    try {
      if (teacherId) {
        await apiSend(`/api/teachers/${teacherId}`, "PATCH", values);
        toast.success("Data guru diperbarui");
      } else {
        await apiSend("/api/teachers", "POST", values);
        toast.success("Guru ditambahkan");
      }
      router.push("/admin/teachers");
    } catch (err) {
      if (!setFormErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan data guru");
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
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jawatan</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Foto</FormLabel>
              <FormControl>
                <ImagePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografi</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kedudukan (Urutan Paparan)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={9999}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-32"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Nombor lebih kecil dipapar dahulu. Guna 0, 1, 2... untuk susun atur guru mengikut jawatan.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}
