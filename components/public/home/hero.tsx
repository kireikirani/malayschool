"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SchoolLogo } from "@/components/public/school-logo";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({
  title,
  tagline,
  badgeText,
  imageUrl,
  primaryLinkLabel,
  primaryLinkUrl,
  secondaryLinkLabel,
  secondaryLinkUrl,
  indicators,
}: {
  title: string;
  tagline: string;
  badgeText?: string | null;
  imageUrl: string;
  primaryLinkLabel: string;
  primaryLinkUrl: string;
  secondaryLinkLabel?: string | null;
  secondaryLinkUrl?: string | null;
  indicators: string[];
}) {
  return (
    <section className="relative overflow-hidden bg-primary">
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="absolute inset-0"
      >
        <Image src={imageUrl} alt={title} fill priority className="object-cover object-[78%_40%]" />
      </motion.div>
      <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
        <div className="flex max-w-2xl flex-col items-start text-left">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <SchoolLogo className="size-20 md:size-24 drop-shadow-[0_8px_24px_rgba(5,23,71,0.45)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
            className="font-heading mt-6 text-3xl leading-[1.15] font-semibold tracking-tight text-primary-foreground md:text-5xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.16 }}
            className="mt-4 text-base text-primary-foreground/80 md:text-lg"
          >
            {tagline}
          </motion.p>

          {badgeText ? (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.24 }} className="mt-4">
              <Badge variant="secondary" className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
                {badgeText}
              </Badge>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.32 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row w-full sm:w-auto"
          >
            <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
              <Link href={primaryLinkUrl}>
                {primaryLinkLabel}
                <ArrowRight />
              </Link>
            </Button>
            {secondaryLinkLabel && secondaryLinkUrl ? (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href={secondaryLinkUrl}>{secondaryLinkLabel}</Link>
              </Button>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-start gap-x-6 gap-y-3"
          >
            {indicators.map((label) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                <span className="size-1.5 rounded-full bg-primary-foreground/70" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
