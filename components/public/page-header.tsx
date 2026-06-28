"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SCHOOL_NAME } from "@/lib/brand";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary">
      <Image
        src="/gallery/sekolah/bangunan-sekolah.jpg"
        alt={`Bangunan ${SCHOOL_NAME}`}
        fill
        className="object-cover object-[78%_40%] opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/90 to-primary" />

      <div className="relative mx-auto max-w-3xl px-4 py-14 text-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {eyebrow && (
            <span className="text-sm font-semibold tracking-wide text-primary-foreground/70 uppercase">
              {eyebrow}
            </span>
          )}
          <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-primary-foreground md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80 md:text-base">{description}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
