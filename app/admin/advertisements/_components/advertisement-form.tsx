"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageTour } from "@/components/admin/tour/page-tour";
import { advertisementFormSteps } from "@/components/admin/tour/tour-steps";
import { createAdvertisementSchema } from "@/lib/validations/advertisement.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";
import { cn } from "@/lib/utils";

type AdFormValues = z.input<typeof createAdvertisementSchema>;

const TYPE_OPTIONS = [
  { value: "adsense_code", label: "Kode Google AdSense" },
  { value: "html_script", label: "HTML/Script" },
  { value: "banner_image", label: "Gambar Banner (URL)" },
  { value: "external_link", label: "Tautan Eksternal" },
];

const PLACEMENT_OPTIONS = [
  { value: "homepage_top", label: "Atas Beranda" },
  { value: "homepage_sidebar", label: "Sidebar Beranda" },
  { value: "news_detail", label: "Detail Berita" },
  { value: "footer", label: "Footer" },
];

const CONTENT_HELP: Record<string, string> = {
  adsense_code: "Tempelkan kode Google AdSense di sini.",
  html_script: "Tempelkan kode HTML/script di sini.",
  banner_image: "Masukkan URL gambar banner.",
  external_link: "Masukkan URL tautan tujuan.",
};

const PLACEMENT_HELP: Record<string, string> = {
  homepage_top: "Muncul di area atas beranda.",
  homepage_sidebar: "Muncul di area bawah konten beranda.",
  news_detail: "Muncul di halaman detail berita.",
  footer: "Muncul sebelum informasi footer.",
};

export function AdvertisementForm({
  adId,
  initialData,
}: {
  adId?: string;
  initialData?: Partial<AdFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdFormValues>({
    resolver: zodResolver(createAdvertisementSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      type: initialData?.type ?? "adsense_code",
      placement: initialData?.placement ?? "homepage_top",
      content: initialData?.content ?? "",
      status: initialData?.status ?? "inactive",
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
    },
  });

  const selectedType = useWatch({ control: form.control, name: "type" });
  const selectedPlacement = useWatch({ control: form.control, name: "placement" });
  const status = useWatch({ control: form.control, name: "status" });
  const content = useWatch({ control: form.control, name: "content" });

  async function onSubmit(values: AdFormValues) {
    setIsSubmitting(true);
    try {
      if (adId) {
        await apiSend(`/api/advertisements/${adId}`, "PATCH", values);
        toast.success("Iklan diperbarui");
      } else {
        await apiSend("/api/advertisements", "POST", values);
        toast.success("Iklan dibuat");
      }
      router.push("/admin/advertisements");
    } catch (err) {
      if (!setFormErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan iklan");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <PageTour tourKey="advertisement-form" steps={advertisementFormSteps} />
      </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Iklan</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Nama dalaman untuk mengenal pasti iklan ini. Tidak dipaparkan kepada pengunjung.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div data-tour="ad-form-type" className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Jenis konten iklan yang akan dimasukkan.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="placement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Penempatan</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLACEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Lokasi di laman web di mana iklan akan muncul.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div data-tour="ad-form-content">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} placeholder={CONTENT_HELP[selectedType ?? "adsense_code"]} />
              </FormControl>
              <p className="text-xs text-muted-foreground">{PLACEMENT_HELP[selectedPlacement ?? "homepage_top"]}</p>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => {
              const dateValue = field.value as Date | undefined;
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Mulai Tampil</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("justify-start font-normal", !dateValue && "text-muted-foreground")}
                        >
                          <CalendarIcon />
                          {dateValue ? format(dateValue, "PPP") : "Tanpa batas"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateValue} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Tarikh iklan mula dipaparkan. Kosongkan untuk tanpa had.</FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => {
              const dateValue = field.value as Date | undefined;
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Selesai Tampil</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("justify-start font-normal", !dateValue && "text-muted-foreground")}
                        >
                          <CalendarIcon />
                          {dateValue ? format(dateValue, "PPP") : "Tanpa batas"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateValue} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Tarikh iklan berhenti dipaparkan. Kosongkan untuk tanpa had.</FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
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
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {status === "active"
                  ? "Iklan akan tampil di website jika masih dalam periode tayang."
                  : "Iklan disimpan tetapi tidak akan tampil di website."}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div data-tour="ad-form-preview" className="space-y-3 border border-border/70 bg-card p-4">
          <div>
            <p className="text-sm font-medium">Pratinjau Ringkas</p>
            <p className="text-xs text-muted-foreground">
              Pastikan tipe, placement, dan status tayang sudah sesuai sebelum menyimpan.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Placement:</span>{" "}
              {PLACEMENT_OPTIONS.find((option) => option.value === selectedPlacement)?.label ?? selectedPlacement}
            </p>
            <p>
              <span className="font-medium">Status:</span> {status === "active" ? "Aktif" : "Nonaktif"}
            </p>
          </div>
          <div className="border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            {selectedType === "banner_image" && (content?.trim() ? `Banner image URL: ${content}` : "URL banner akan muncul di sini.")}
            {selectedType === "external_link" && (content?.trim() ? `Tautan eksternal: ${content}` : "Tautan eksternal akan muncul di sini.")}
            {selectedType === "adsense_code" && (content?.trim() ? "Kode AdSense siap disimpan." : "Tempelkan kode AdSense untuk pratinjau status konten.")}
            {selectedType === "html_script" && (content?.trim() ? "HTML/Script siap disimpan." : "Tempelkan HTML/script untuk pratinjau status konten.")}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
    </div>
  );
}
