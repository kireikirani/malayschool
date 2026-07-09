"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const teacherSelfUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(255),
  position: z.string().trim().max(255).optional().nullable(),
  photo: z.string().trim().max(2048).optional().nullable(),
  biography: z.string().trim().max(5000).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  subject: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

type FormValues = z.infer<typeof teacherSelfUpdateSchema>;

export function ProfileForm({ initialData }: { initialData: FormValues }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(teacherSelfUpdateSchema),
    defaultValues: {
      name: initialData.name ?? "",
      position: initialData.position ?? "",
      photo: initialData.photo ?? "",
      biography: initialData.biography ?? "",
      phone: initialData.phone ?? "",
      subject: initialData.subject ?? "",
      notes: initialData.notes ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teacher-self-service", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Gagal menyimpan maklumat.");
      }

      toast.success("Profil anda telah dikemaskini.");
      router.push("/teacher");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengemaskini profil.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kemaskini Profil</h1>
          <p className="text-muted-foreground">Kemaskini butiran profil awam anda di sini.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Butiran Profil</CardTitle>
          <CardDescription>
            Sila pastikan maklumat di bawah adalah tepat sebelum disimpan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Penuh</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Nama penuh anda seperti dalam dokumen rasmi.</FormDescription>
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
                      <Input {...field} value={field.value ?? ""} placeholder="Contoh: Guru Matematik, Ketua Bidang Sains" />
                    </FormControl>
                    <FormDescription>Jawatan atau jawatan khas anda di sekolah.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto Profil</FormLabel>
                    <FormControl>
                      <ImagePicker value={field.value ?? undefined} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>Gambar profil anda. Saiz disyorkan: 400×400 piksel.</FormDescription>
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
                        <Input {...field} value={field.value ?? ""} />
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
                        <Input {...field} value={field.value ?? ""} placeholder="Contoh: Matematik, Sains" />
                      </FormControl>
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
                    <FormLabel>Biografi / Kelayakan</FormLabel>
                    <FormControl>
                      <Textarea rows={6} {...field} value={field.value ?? ""} placeholder="Tulis latar belakang, kelayakan akademik, dan pengalaman mengajar anda di sini..." />
                    </FormControl>
                    <FormDescription>Biografi ini akan dipaparkan pada halaman profil awam anda.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {initialData.notes && (
                <div className="rounded-lg bg-muted p-4 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Nota Khas (Daripada Admin)</span>
                  <p className="text-xs text-muted-foreground">{initialData.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/teacher">Batal</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
