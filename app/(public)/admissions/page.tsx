import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, FileCheck2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileCard } from "@/components/public/file-card";
import { SCHOOL_NAME } from "@/lib/brand";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Lengkapkan Borang",
    desc: "Muat turun dan isi borang permohonan pendaftaran di bawah.",
  },
  {
    icon: FileCheck2,
    title: "Sediakan Dokumen",
    desc: "Sijil kelahiran, salinan kad pengenalan ibu bapa, dan keputusan akademik terkini.",
  },
  {
    icon: CalendarCheck,
    title: "Temu Duga & Pengesahan",
    desc: "Pihak sekolah akan menghubungi anda untuk menetapkan sesi temu duga ringkas.",
  },
];

const DOCUMENTS = [
  { name: "Borang Permohonan Pendaftaran.pdf", url: "/documents/borang-permohonan.pdf", size: 482_000 },
  { name: "Senarai Yuran Sekolah.xlsx", url: "/documents/senarai-yuran.xlsx", size: 64_000 },
  { name: "Panduan Pendaftaran Ibu Bapa.docx", url: "/documents/panduan-pendaftaran.docx", size: 210_000 },
];

export default function AdmissionsPage() {
  return (
    <div>
      <section className="border-b border-border/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Pendaftaran Pelajar</span>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Permohonan Pendaftaran Sesi 2026/2027
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Ikuti tiga langkah mudah di bawah untuk mendaftarkan anak anda di {SCHOOL_NAME}. Tempat terhad
            mengikut tarikh permohonan diterima.
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
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Dokumen Permohonan</span>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
              Muat Turun Borang & Dokumen
            </h2>
          </div>
          <div className="mt-10 space-y-4">
            {DOCUMENTS.map((doc) => (
              <FileCard key={doc.url} name={doc.name} url={doc.url} size={doc.size} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 border border-border/70 bg-card px-6 py-12 text-center shadow-[0_24px_60px_-44px_rgba(35,24,16,0.5)] md:px-12">
            <h2 className="max-w-lg font-heading text-3xl font-semibold tracking-tight">
              Ada Pertanyaan Sebelum Mendaftar?
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" asChild className="border border-gold/40 bg-gold/20 text-gold-foreground hover:bg-gold/30">
                <Link href="/contact">
                  <Phone />
                  Hubungi Pejabat Pendaftaran
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-border/80 bg-transparent text-foreground hover:bg-muted">
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
