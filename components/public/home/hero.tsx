"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { SchoolLogo } from "@/components/public/school-logo";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({
  title,
  tagline,
  imageUrl,
}: {
  title: string;
  tagline: string;
  imageUrl: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [imageUrl, "/gallery/sekolah/hero-mace.jpg"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative overflow-hidden bg-primary min-h-[calc(100vh-108px)] flex items-center">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {images.map((img, idx) => (
          <motion.div
            key={img}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentIndex === idx ? 1 : 0,
              scale: currentIndex === idx ? 1 : 1.05,
            }}
            transition={{ duration: 1.5, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={img}
              alt={title}
              fill
              priority={idx === 0}
              className="object-cover object-[78%_40%]"
            />
          </motion.div>
        ))}
      </div>

      {/* Mobile-only overlay to ensure readability */}
      <div className="absolute inset-0 bg-primary/40 md:hidden" />

      {/* Desktop ultra-smooth multi-stop gradient overlay */}
      <div
        className="absolute inset-y-0 left-0 w-full md:w-[75%] bg-gradient-to-r from-primary to-transparent"
        style={{
          backgroundImage: 'linear-gradient(to right, oklch(0.228 0.093 263.9 / 0.95) 0%, oklch(0.228 0.093 263.9 / 0.90) 35%, oklch(0.228 0.093 263.9 / 0.70) 50%, oklch(0.228 0.093 263.9 / 0.50) 65%, oklch(0.228 0.093 263.9 / 0.30) 78%, oklch(0.228 0.093 263.9 / 0.10) 90%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32 w-full">
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
        </div>
      </div>

    </section>
  );
}
