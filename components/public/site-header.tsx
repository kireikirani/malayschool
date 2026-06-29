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

const NAV_LINKS = [
  { href: "/", label: "Utama" },
  { href: "/about", label: "Tentang Sekolah" },
  { href: "/teachers", label: "Guru & Staf" },
  { href: "/news", label: "Berita" },
  { href: "/gallery", label: "Galeri" },
  { href: "/contact", label: "Kontak" },
];

const UNIT_LINKS = [
  ...UNITS.map((unit) => ({ href: `/${unit.slug}`, label: unit.navLabel })),
  { href: "/borang", label: "Borang" },
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
          <Link href="/" className="flex items-center gap-3">
            <SchoolLogo className="size-10" />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-base font-semibold text-foreground">{SCHOOL_NAME}</span>
              <span className="text-[11px] tracking-wide text-muted-foreground">{SCHOOL_TAGLINE}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:text-foreground hover:after:w-full",
                )}
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground transition-colors outline-none hover:text-foreground">
                Unit Pengurusan
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {UNIT_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden md:block">
            <Button asChild className="px-4">
              <Link href="/dokumen-sekolah">Dokumen Sekolah</Link>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-heading">{SCHOOL_NAME}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <p className="pt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Unit Pengurusan
                </p>
                {UNIT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-2" onClick={() => setOpen(false)}>
                  <Link href="/dokumen-sekolah">Dokumen Sekolah</Link>
                </Button>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="pt-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Login Admin
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </motion.div>
  );
}
