import { ArrowRight, BookOpen, Puzzle, School, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

const PROGRAMS = [
  {
    icon: School,
    label: "Pra-Sekolah",
    title: "Tadika & Prasekolah",
    desc: "Asas literasi, numerasi dan kemahiran sosial melalui pembelajaran berasaskan permainan.",
  },
  {
    icon: BookOpen,
    label: "Rendah",
    title: "Sekolah Rendah",
    desc: "Kurikulum KSSR dengan penekanan pada Bahasa Melayu, Bahasa Inggeris, dan Sains.",
  },
  {
    icon: Trophy,
    label: "Menengah",
    title: "Sekolah Menengah",
    desc: "Kurikulum KSSM dengan jalur aliran Sains dan Sastera, disokong bimbingan SPM.",
  },
  {
    icon: Puzzle,
    label: "Ko-Kurikulum",
    title: "Aktiviti Ko-Kurikulum",
    desc: "Kelab, persatuan, sukan dan unit beruniform untuk membina kepimpinan dan bakat.",
  },
];

export function AcademicPrograms() {
  return (
    <section className="border-y border-border/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollAnimation direction="up" className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold tracking-wide text-primary uppercase">Program Akademik</span>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Laluan Pembelajaran untuk Setiap Peringkat
            </h2>
          </div>
          <Link href="/about" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat kurikulum penuh
            <ArrowRight className="size-4" />
          </Link>
        </ScrollAnimation>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map(({ icon: Icon, label, title, desc }, i) => (
            <ScrollAnimation key={title} direction="up" delay={i * 0.08}>
              <Card className="border-border/70 bg-card">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Icon className="size-6 text-gold" />
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
