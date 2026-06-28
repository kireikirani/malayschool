import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, CalendarCheck, ClipboardList, FileCheck2, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { media } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileCard } from "@/components/public/file-card";
import { SCHOOL_NAME } from "@/lib/brand";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Upload Dari Admin",
    desc: "Admin sekolah memuat naik fail rasmi melalui dashboard menggunakan UploadThing, bukan terus ke database utama.",
  },
  {
    icon: FileCheck2,
    title: "Fail Dipaparkan Otomatis",
    desc: "Metadata fail disimpan di sistem, lalu dokumen seperti PDF, XLSX, XLS, dan CSV terus tersedia di halaman ini.",
  },
  {
    icon: CalendarCheck,
    title: "Maklumat Sentiasa Terkini",
    desc: "Apabila admin mengganti fail, kandungan terkini sekolah akan terus dikemaskini untuk pelawat laman.",
  },
];

export async function SchoolDocumentsPage() {
  const documents = await db
    .select({
      id: media.id,
      name: media.fileName,
      url: media.filePath,
      size: media.fileSize,
    })
    .from(media)
    .where(eq(media.folder, "documents"))
    .orderBy(desc(media.uploadedAt));

  return (
    <div>
      <section className="border-b border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Dokumen & Data Sekolah</span>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Dokumen Rasmi Yang Dikelola Oleh Admin Sekolah
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Halaman ini memaparkan fail rasmi {SCHOOL_NAME} yang dimuat naik oleh admin. Jika admin memuat naik
            `.xlsx`, `.xls`, atau `.csv`, data akan dibaca dan dipaparkan dalam bentuk jadual React.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <Card key={title}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-heading text-sm font-semibold text-gold">{`0${i + 1}`}</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Fail Aktif</span>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Dokumen Yang Sedang Dipaparkan</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Semua objek fail berada di UploadThing agar penyimpanan utama lebih ringan, sementara database hanya
              menyimpan rujukan fail, nama, jenis, dan metadata lain.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {documents.length === 0 ? (
              <EmptyState
                compact
                title="Belum ada dokumen sekolah"
                description="Admin sekolah belum memuat naik dokumen rasmi untuk dipaparkan di halaman ini."
              />
            ) : (
              documents.map((doc) => <FileCard key={doc.id} name={doc.name} url={doc.url} size={doc.size} />)
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 border border-border/70 bg-card px-6 py-12 text-center shadow-[0_24px_60px_-44px_rgba(35,24,16,0.5)] md:px-12">
            <h2 className="max-w-lg font-heading text-3xl font-semibold tracking-tight">
              Perlu Bantuan Tentang Dokumen Atau Maklumat Sekolah?
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="border border-gold/40 bg-gold/20 text-gold-foreground hover:bg-gold/30"
              >
                <Link href="/contact">
                  <Phone />
                  Hubungi Pejabat
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-border/80 bg-transparent text-foreground hover:bg-muted"
              >
                <Link href="/about">
                  Tentang Sekolah
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
