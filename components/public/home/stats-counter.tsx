import { SCHOOL_STATS } from "@/lib/brand";

export function StatsCounter({ teacherCount }: { teacherCount: number }) {
  const STATS = [
    { label: "Jumlah Guru", value: teacherCount },
    { label: "Jumlah AKP", value: SCHOOL_STATS.supportStaff },
    { label: "Jumlah Pelajar", value: SCHOOL_STATS.students },
    { label: "Jumlah Kelas", value: SCHOOL_STATS.classes },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <div key={label} className="border border-border/70 bg-card px-5 py-6 text-center shadow-[0_16px_40px_-34px_rgba(35,24,16,0.5)]">
            <p className="font-heading text-4xl font-semibold text-primary md:text-5xl">
              {value.toLocaleString("ms-MY")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
