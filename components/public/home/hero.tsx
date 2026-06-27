import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SCHOOL_NAME } from "@/lib/brand";

const TRUST_INDICATORS = [
  { icon: GraduationCap, label: "30+ Tahun Pengalaman" },
  { icon: Users, label: "1,200+ Pelajar Aktif" },
  { icon: ShieldCheck, label: "Persekitaran Selamat" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-24">
        <div className="space-y-6">
          <Badge variant="secondary" className="border border-gold/30 bg-gold/12 text-gold-foreground">
            Sesi Persekolahan 2026/2027
          </Badge>
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Cemerlang Akademik,
            <br />
            Gemilang Sahsiah
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            {SCHOOL_NAME} memadukan kecemerlangan akademik dengan pembinaan sahsiah
            unggul, didokong oleh tenaga pengajar berpengalaman dan kemudahan
            pembelajaran moden.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/admissions">
                Daftar Sekarang
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Tempah Lawatan</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
            {TRUST_INDICATORS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-border/70 bg-muted shadow-[0_24px_60px_-40px_rgba(35,24,16,0.5)]">
            <Image
              src="/gallery/sekolah/bangunan-sekolah.jpg"
              alt={`Bangunan ${SCHOOL_NAME}`}
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden border border-border/70 bg-card px-5 py-4 shadow-[0_18px_40px_-30px_rgba(35,24,16,0.55)] sm:block">
            <p className="font-heading text-2xl font-semibold text-primary">98%</p>
            <p className="text-xs text-muted-foreground">Kelulusan SPM Cemerlang</p>
          </div>
        </div>
      </div>
    </section>
  );
}
