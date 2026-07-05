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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImagePicker } from "@/components/admin/image-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { createNewsSchema } from "@/lib/validations/news.schema";
import { apiSend } from "@/lib/fetcher";
import { setFormErrors } from "@/lib/set-form-errors";
import { cn } from "@/lib/utils";

type NewsFormValues = z.input<typeof createNewsSchema>;

export function NewsForm({
  newsId,
  initialData,
}: {
  newsId?: string;
  initialData?: Partial<NewsFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      content: initialData?.content ?? "",
      thumbnail: initialData?.thumbnail ?? undefined,
      status: initialData?.status ?? "draft",
      publishDate: initialData?.publishDate,
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? "",
      ogImage: initialData?.ogImage ?? undefined,
    },
  });

  async function onSubmit(values: NewsFormValues) {
    setIsSubmitting(true);
    try {
      if (newsId) {
        await apiSend(`/api/news/${newsId}`, "PATCH", values);
        toast.success("Berita diperbarui");
      } else {
        await apiSend("/api/news", "POST", values);
        toast.success("Berita dibuat");
      }
      router.push("/admin/news");
    } catch (err) {
      if (!setFormErrors(err, form.setError)) {
        toast.error(err instanceof Error ? err.message : "Gagal menyimpan berita");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Tajuk berita yang akan dipaparkan kepada pembaca.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (opsional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} placeholder="Otomatis dari judul jika dikosongkan" />
              </FormControl>
              <FormDescription>URL unik berita. Kosongkan untuk dijana secara automatik dari tajuk.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>Isi kandungan penuh berita. Gunakan toolbar untuk format teks.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <ImagePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>Gambar kecil yang mewakili berita dalam senarai. Saiz disyorkan: 800×450 piksel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Diterbitkan</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Draft tidak dipaparkan. Tukar ke "Diterbitkan" untuk tampilkan kepada pembaca.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publishDate"
            render={({ field }) => {
              const dateValue = field.value as Date | undefined;
              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Terbit</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn("justify-start font-normal", !dateValue && "text-muted-foreground")}
                        >
                          <CalendarIcon />
                          {dateValue ? format(dateValue, "PPP") : "Pilih tanggal"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateValue} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Kosongkan untuk menggunakan tarikh semasa.</FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <FormField
          control={form.control}
          name="metaTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title (SEO)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormDescription>Tajuk untuk enjin carian. Kosongkan untuk gunakan tajuk berita. Disyorkan: di bawah 60 aksara.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description (SEO)</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value as string} />
              </FormControl>
              <FormDescription>Ringkasan pendek untuk enjin carian. Disyorkan: 150–160 aksara.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ogImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Open Graph Image</FormLabel>
              <FormControl>
                <ImagePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>Gambar yang dipaparkan apabila pautan berita dikongsi di media sosial.</FormDescription>
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
