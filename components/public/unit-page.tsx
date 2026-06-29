import Link from "next/link";
import { ShieldCheck, HeartHandshake, MessageCircle, Home, Clock, Network } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { PageHeader } from "@/components/public/page-header";
import { UNIT_SERVICES, UNIT_OPERATING_HOURS, type Unit } from "@/lib/units";
import { SCHOOL_NAME } from "@/lib/brand";

const SERVICE_ICONS = [ShieldCheck, HeartHandshake, MessageCircle, Home];

export function UnitPage({ unit }: { unit: Unit }) {
  return (
    <div>
      <PageHeader eyebrow={SCHOOL_NAME} title={unit.title} description={`${unit.headName} — ${unit.headPosition}`} />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 md:py-16">
        <ScrollAnimation direction="up" className="flex flex-wrap items-center justify-between gap-4 border border-border/70 bg-card px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
              <Network className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Carta Organisasi Pengurusan</p>
              <p className="text-xs text-muted-foreground">Struktur pentadbiran {unit.title}</p>
            </div>
          </div>
          <Link href="/contact" className="text-sm font-medium text-primary hover:underline">
            Hubungi Pejabat
          </Link>
        </ScrollAnimation>

        <section>
          <ScrollAnimation direction="up" className="text-center">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Perkhidmatan Utama</span>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Skop Tanggungjawab {unit.title}
            </h2>
          </ScrollAnimation>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {UNIT_SERVICES.map(({ title, desc }, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <ScrollAnimation key={title} direction="up" delay={i * 0.08}>
                  <Card>
                    <CardContent className="space-y-3">
                      <span className="flex size-11 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <h3 className="font-heading text-lg font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                      <Link href="/contact" className="inline-block text-sm font-medium text-primary hover:underline">
                        Lihat Lanjut
                      </Link>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              );
            })}
          </div>
        </section>

        <section>
          <ScrollAnimation direction="up" className="text-center">
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Pencapaian</span>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              KPI {unit.title}
            </h2>
          </ScrollAnimation>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {unit.kpis.map((kpi, i) => (
              <ScrollAnimation key={kpi.label} direction="up" delay={i * 0.08}>
                <div className="border border-border/70 bg-card px-5 py-6 text-center shadow-[0_16px_40px_-34px_rgba(35,24,16,0.5)]">
                  <p className="font-heading text-4xl font-semibold text-primary md:text-5xl">
                    <CountUp value={kpi.value} suffix={kpi.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </section>

        <ScrollAnimation direction="up" className="grid gap-6 border border-border/70 bg-card px-6 py-8 sm:grid-cols-[1fr_1fr] md:px-10">
          <div>
            <h3 className="font-heading text-lg font-semibold">Maklumat Umum</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Semua pelajar tertakluk kepada Buku Peraturan Sekolah. Kehadiran adalah wajib dan pemakaian seragam
              sekolah hendaklah sentiasa kemas mengikut ketetapan Kementerian Pendidikan Malaysia.
            </p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Clock className="size-4 text-primary" />
              Waktu Operasi {unit.title}
            </h3>
            <dl className="mt-2 space-y-1 text-sm">
              {UNIT_OPERATING_HOURS.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-muted-foreground">
                  <dt>{row.label}</dt>
                  <dd className="text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}
