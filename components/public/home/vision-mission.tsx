import { Eye, Target } from "lucide-react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

export function VisionMission({
  vision,
  mission,
}: {
  vision: string;
  mission: string;
}) {
  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <ScrollAnimation direction="up" className="mb-10 text-center">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Halatuju Kami</span>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Visi &amp; Misi Sekolah
          </h2>
        </ScrollAnimation>

        <div className="grid gap-6 md:grid-cols-2">
          {vision && (
            <ScrollAnimation direction="left" delay={0.1} className="h-full">
              <div className="relative h-full overflow-hidden bg-card p-7 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Eye className="size-5 text-primary" />
                  </span>
                  <h3 className="font-heading text-xl font-semibold">Visi</h3>
                </div>
                <p className="text-base leading-relaxed text-foreground/80">{vision}</p>
              </div>
            </ScrollAnimation>
          )}

          {mission && (
            <ScrollAnimation direction="right" delay={0.15} className="h-full">
              <div className="relative h-full overflow-hidden bg-card p-7 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-teal-600" />
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
                    <Target className="size-5 text-teal-600" />
                  </span>
                  <h3 className="font-heading text-xl font-semibold">Misi</h3>
                </div>
                <p className="text-base leading-relaxed text-foreground/80">{mission}</p>
              </div>
            </ScrollAnimation>
          )}
        </div>
      </div>
    </section>
  );
}
