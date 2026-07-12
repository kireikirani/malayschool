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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { PageTour } from "@/components/admin/tour/page-tour";
import { teacherFormSteps } from "@/components/admin/tour/tour-steps";
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
      phone: initialData?.phone ?? "",
      subject: initialData?.subject ?? "",
      notes: initialData?.notes ?? "",
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
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <PageTour tourKey="teacher-form" steps={teacherFormSteps} />
      </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Nama penuh guru seperti yang akan dipaparkan di laman web.</FormDescription>
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
              <FormDescription>Contoh: Guru Matematik, Ketua Panitia Bahasa Inggeris.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Telefon</FormLabel>
                <FormControl>
                  <Input {...field} value={(field.value as string) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjek Diajar</FormLabel>
                <FormControl>
                  <Input {...field} value={(field.value as string) ?? ""} placeholder="Contoh: Matematik, Sains" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nota Khas (dari Admin)</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={(field.value as string) ?? ""} />
              </FormControl>
              <FormDescription>Nota tambahan yang hanya boleh dilihat oleh guru pada dashboardnya.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div data-tour="teacher-form-photo">
          <FormField
            control={form.control}
            name="photo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto</FormLabel>
                <FormControl>
                  <ImagePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormDescription>Gambar profil guru. Saiz disyorkan: 400×400 piksel.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografi</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} value={field.value as string} />
              </FormControl>
              <FormDescription>Latar belakang, kelayakan, dan pengalaman guru. Dipaparkan di halaman profil guru.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div data-tour="teacher-form-sort">
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
                  value={field.value as number}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-32"
                />
              </FormControl>
              <FormDescription>Nombor lebih kecil dipapar dahulu. Guna 0, 1, 2… untuk susun atur guru mengikut jawatan.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        <div data-tour="teacher-form-status">
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
                <FormDescription>Hanya guru "Aktif" yang dipaparkan di laman web awam.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
    </div>
  );
}
