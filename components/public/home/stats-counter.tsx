import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { CountUp } from "@/components/ui/count-up";

export function StatsCounter({
  teacherCount,
  students,
  supportStaff,
  classes,
  spmCandidates,
}: {
  teacherCount: number;
  students: number;
  supportStaff: number;
  classes: number;
  spmCandidates: number;
}) {
  const stats = [
    { label: "Jumlah Guru", value: teacherCount },
    { label: "Jumlah Staf", value: supportStaff },
    { label: "Jumlah Pelajar", value: students },
    { label: "Jumlah Kelas", value: classes },
    { label: "Bilangan Calon SPM", value: spmCandidates },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-5">
        {stats.map(({ label, value }, i) => (
          <ScrollAnimation key={label} direction="up" delay={i * 0.08}>
            <div className="border border-border/70 bg-card px-5 py-6 text-center shadow-[0_16px_40px_-34px_rgba(35,24,16,0.5)]">
              <p className="font-heading text-4xl font-semibold text-primary md:text-5xl">
                <CountUp value={value} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{label}</p>
            </div>
          </ScrollAnimation>
        ))}
      </div>
    </section>
  );
}
