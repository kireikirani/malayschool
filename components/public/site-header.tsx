"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnnouncementBar } from "@/components/public/announcement-bar";
import { SchoolLogo } from "@/components/public/school-logo";
import { SCHOOL_NAME, SCHOOL_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Utama" },
  { href: "/about", label: "Tentang Sekolah" },
  { href: "/teachers", label: "Guru & Staf" },
  { href: "/news", label: "Berita" },
  { href: "/gallery", label: "Galeri" },
  { href: "/contact", label: "Kontak" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
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
                  "text-muted-foreground transition-colors hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
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
    </div>
  );
}
