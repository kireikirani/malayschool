"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

  const selectedType = form.watch("type");

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Iklan</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} placeholder={CONTENT_HELP[selectedType ?? "adsense_code"]} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
