"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createPsikometrikSchema } from "@/lib/validations/psikometrik.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";

const formSchema = createPsikometrikSchema.extend({
  scores: z.array(z.object({ key: z.string().trim().min(1, "Nama tret diperlukan"), value: z.coerce.number() })),
});

type Values = z.input<typeof formSchema>;

type InitialData = {
  noPengenalan?: string;
  namaMurid?: string;
  kodSekolah?: string;
  namaSekolah?: string;
  namaKelas?: string;
  tarikh?: string;
  scores?: Record<string, number>;
};

export function PsikometrikForm({ recordId, initialData }: { recordId?: number; initialData?: InitialData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultScores = initialData?.scores
    ? Object.entries(initialData.scores).map(([key, value]) => ({ key, value }))
    : [{ key: "", value: 0 }];

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noPengenalan: initialData?.noPengenalan ?? "",
      namaMurid: initialData?.namaMurid ?? "",
      kodSekolah: initialData?.kodSekolah ?? "",
      namaSekolah: initialData?.namaSekolah ?? "",
      namaKelas: initialData?.namaKelas ?? "",
      tarikh: initialData?.tarikh ?? "",
      scores: defaultScores,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "scores" });

  async function onSubmit(values: Values) {
    setIsSubmitting(true);
    try {
      const scoresObj = Object.fromEntries(values.scores.map(({ key, value }) => [key, value]));
      const payload = { ...values, scores: scoresObj };

      const url = recordId ? `/api/admin/psikometrik/${recordId}` : "/api/admin/psikometrik";
      const method = recordId ? "PATCH" : "POST";
      await apiSend(url, method, payload);
      toast.success(recordId ? "Rekod dikemaskini" : "Rekod ditambah");
      router.push("/admin/psikometrik");
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="noPengenalan"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>No. Pengenalan *</FormLabel>
                <FormControl>
                  <Input placeholder="101109100068" {...field} />
                </FormControl>
                <FormDescription>Nombor IC pelajar tanpa tanda sempang.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="namaMurid"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nama Murid *</FormLabel>
                <FormControl>
                  <Input placeholder="Nama penuh murid..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="namaKelas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kelas</FormLabel>
                <FormControl>
                  <Input placeholder="5 Sains 1" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tarikh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarikh Pentaksiran</FormLabel>
                <FormControl>
                  <Input placeholder="15/07/2026" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="namaSekolah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Sekolah</FormLabel>
                <FormControl>
                  <Input placeholder="SMK..." {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kodSekolah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod Sekolah</FormLabel>
                <FormControl>
                  <Input placeholder="JEA1234" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Skor Tret Personaliti</p>
              <p className="text-xs text-muted-foreground">Tambah setiap tret dan skor yang diperolehi.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: "", value: 0 })}
            >
              <Plus className="size-3.5" />
              Tambah Tret
            </Button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`scores.${index}.key`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Nama tret (cth: Keterbukaan)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`scores.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <Input type="number" placeholder="Skor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : recordId ? "Kemaskini" : "Simpan Rekod"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
