"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnnouncementBar } from "@/components/public/announcement-bar";
import { SchoolLogo } from "@/components/public/school-logo";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/brand";
import { UNITS } from "@/lib/units";
import { cn } from "@/lib/utils";

const ABOUT_LINKS = [
  { href: "/about", label: "Profil Sekolah" },
  { href: "/teachers", label: "Guru & Staf" },
  { href: "/contact", label: "Hubungi Kami" },
];

const NEWS_GALLERY_LINKS = [
  { href: "/news", label: "Berita" },
  { href: "/gallery", label: "Galeri" },
];

const MANAGEMENT_LINKS = [
  { href: "/kurikulum", label: "Kurikulum" },
  { href: "/hem", label: "Hal Ehwal Murid" },
  { href: "/kokurikulum", label: "Kokurikulum" },
  { href: "/tingkatan-6", label: "Tingkatan 6" },
  { href: "/pentadbiran", label: "Pentadbiran" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50"
    >
      <AnnouncementBar />
      <header className="border-b border-border/90 bg-background">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <SchoolLogo className="size-9 sm:size-10" />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-sm sm:text-base font-semibold text-foreground">
                {SCHOOL_NAME}
              </span>
              <span className="hidden sm:block text-[11px] tracking-wide text-muted-foreground">
                {SCHOOL_TAGLINE}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:gap-7 text-sm font-medium lg:flex">
            {/* 1. Utama */}
            <Link
              href="/"
              className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
            >
              Utama
            </Link>

            {/* 2. Tentang Kami */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground transition-colors cursor-pointer outline-none hover:text-foreground">
                Tentang Kami
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ABOUT_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. Berita & Galeri */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground transition-colors cursor-pointer outline-none hover:text-foreground">
                Berita & Galeri
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {NEWS_GALLERY_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 4. Asrama */}
            <Link
              href="/asrama"
              className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
            >
              Asrama
            </Link>

            {/* 5. Pengurusan & Pentadbiran */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground transition-colors cursor-pointer outline-none hover:text-foreground">
                Pengurusan & Pentadbiran
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MANAGEMENT_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 6. UBK */}
            <Link
              href="/ubk"
              className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
            >
              UBK
            </Link>

            {/* 7. Borang */}
            <Link
              href="/borang"
              className="relative text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground hover:after:w-full"
            >
              Borang
            </Link>
          </nav>

          <div className="hidden lg:block">
            <Button asChild className="px-4">
              <Link href="/dokumen-sekolah">Dokumen Sekolah</Link>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="lg:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto pb-8">
              <SheetHeader>
                <SheetTitle className="font-heading text-left">{SCHOOL_NAME}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-5 px-4 my-4">
                {/* Utama */}
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Utama
                </Link>

                {/* Tentang Kami */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Tentang Kami
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {ABOUT_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Berita & Galeri */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Berita & Galeri
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {NEWS_GALLERY_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Asrama */}
                <Link
                  href="/asrama"
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Asrama
                </Link>

                {/* Pengurusan & Pentadbiran */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Pengurusan & Pentadbiran
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {MANAGEMENT_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* UBK */}
                <Link
                  href="/ubk"
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                >
                  UBK
                </Link>

                {/* Borang */}
                <Link
                  href="/borang"
                  onClick={() => setOpen(false)}
                  className="text-base font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Borang
                </Link>

                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <Button asChild className="w-full" onClick={() => setOpen(false)}>
                    <Link href="/dokumen-sekolah">Dokumen Sekolah</Link>
                  </Button>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="text-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Login Admin
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </motion.div>
  );
}
