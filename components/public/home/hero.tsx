"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchoolLogo } from "@/components/public/school-logo";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/brand";

const TRUST_INDICATORS = [
  { icon: GraduationCap, label: "30+ Tahun Pengalaman" },
  { icon: Users, label: "1,200+ Pelajar Aktif" },
  { icon: ShieldCheck, label: "Persekitaran Selamat" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="absolute inset-0"
      >
        <Image
          src="/gallery/sekolah/bangunan-sekolah.jpg"
          alt={`Bangunan ${SCHOOL_NAME}`}
          fill
          priority
          className="object-cover object-[78%_40%]"
        />
      </motion.div>
      {/* duotone navy tint over the photo, vivid but still on-brand */}
      <div className="absolute inset-0 bg-primary/55 mix-blend-color" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-primary/40" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <SchoolLogo className="size-20 md:size-24 drop-shadow-[0_8px_24px_rgba(5,23,71,0.45)]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
          className="font-heading mt-6 text-3xl leading-[1.15] font-semibold tracking-tight text-primary-foreground md:text-5xl"
        >
          {SCHOOL_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
          className="mt-4 max-w-xl text-base text-primary-foreground/80 md:text-lg"
        >
          {SCHOOL_TAGLINE}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.24 }}
          className="mt-2"
        >
          <Badge
            variant="secondary"
            className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
          >
            Sesi Persekolahan 2026/2027
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.32 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dokumen-sekolah">
              Lihat Dokumen
              <ArrowRight />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/contact">Tempah Lawatan</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {TRUST_INDICATORS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
              <Icon className="size-4" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
