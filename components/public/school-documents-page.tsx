import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, FileCheck2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SCHOOL_NAME } from "@/lib/brand";
import { DocumentExplorer } from "@/components/public/document-explorer";

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
              <Card key={title} className="h-full">
                <CardContent className="flex h-full flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="size-7 text-primary" />
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

      <section className="border-y border-border/60 py-16 md:py-20 bg-muted/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Portal Awam</span>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Peneroka Fail & Dokumen Sekolah</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Akses terus fail-fail rasmi dan pekeliling sekolah dari Google Drive yang diintegrasikan secara interaktif di bawah.
            </p>
          </div>

          <DocumentExplorer title="PORTAL DOKUMEN SEKOLAH" />
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
