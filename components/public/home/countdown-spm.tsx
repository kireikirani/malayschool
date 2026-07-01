"use client";

import { useEffect, useMemo, useState } from "react";
import { ScrollAnimation } from "@/components/ui/scroll-animation";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetDate: string): TimeLeft {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownSpm({ spmDate }: { spmDate: string }) {
  const [time, setTime] = useState<TimeLeft | null>(null);
  const targetDate = useMemo(() => new Date(spmDate), [spmDate]);

  useEffect(() => {
    setTime(getTimeLeft(spmDate));
    const id = setInterval(() => setTime(getTimeLeft(spmDate)), 1000);
    return () => clearInterval(id);
  }, [spmDate]);

  const isPast = time ? targetDate < new Date() : false;

  return (
    <section className="border-y border-border/60 bg-primary py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <ScrollAnimation direction="up">
          <span className="text-xs font-semibold tracking-widest text-primary-foreground/70 uppercase">
            Kiraan Masa
          </span>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-primary-foreground md:text-3xl">
            {isPast ? "SPM Telah Bermula" : "Menghitung Hari ke SPM"}
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {targetDate.toLocaleDateString("ms-MY", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={0.1}>
          <div className="mt-8 flex items-center justify-center gap-3 md:gap-6">
            {[
              { label: "Hari", value: time ? time.days : "--" },
              { label: "Jam", value: time ? pad(time.hours) : "--" },
              { label: "Minit", value: time ? pad(time.minutes) : "--" },
              { label: "Saat", value: time ? pad(time.seconds) : "--" },
            ].map(({ label, value }, i) => (
              <div key={label} className="flex items-start gap-3 md:gap-6">
                {i > 0 && (
                  <span className="mt-2 font-heading text-2xl font-bold text-primary-foreground/50 md:text-4xl">
                    :
                  </span>
                )}
                <div className="flex min-w-[60px] flex-col items-center md:min-w-[80px]">
                  <span className="font-heading text-4xl font-bold tabular-nums text-primary-foreground md:text-6xl">
                    {value}
                  </span>
                  <span className="mt-1 text-[11px] font-medium tracking-widest text-primary-foreground/60 uppercase">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={0.2}>
          <p className="mt-8 text-sm text-primary-foreground/70">
            &ldquo;Belajar bersungguh-sungguh. Kejayaan anda adalah kebanggaan kami.&rdquo;
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
}
