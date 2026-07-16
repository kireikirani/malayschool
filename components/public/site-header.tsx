"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const ASRAMA_LINKS = [
  { href: "/asrama", label: "Maklumat Asrama" },
  { href: "/asrama/senarai-pelajar", label: "Senarai Pelajar" },
  { href: "/asrama/permohonan?jenis=pulang_bermalam", label: "Borang Pulang" },
  { href: "/asrama/permohonan?jenis=outing", label: "Borang Outing" },
  { href: "/asrama/permohonan?jenis=mc_sakit", label: "Borang Rawatan (MC)" },
  { href: "/asrama/permohonan/semak", label: "Semak Status" },
];

const MANAGEMENT_LINKS = [
  { href: "/pentadbiran", label: "Pentadbiran" },
  { href: "/kurikulum", label: "Kurikulum" },
  { href: "/hem", label: "Hal Ehwal Murid" },
  { href: "/kokurikulum", label: "Kokurikulum" },
  { href: "/tingkatan-6", label: "Tingkatan 6" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isUtamaActive = pathname === "/";
  const isAboutActive = ABOUT_LINKS.some((link) => pathname === link.href || pathname.startsWith(link.href + "/"));
  const isNewsGalleryActive = NEWS_GALLERY_LINKS.some((link) => pathname === link.href || pathname.startsWith(link.href + "/"));
  const isAsramaActive = pathname === "/asrama" || pathname.startsWith("/asrama/");
  const isManagementActive = MANAGEMENT_LINKS.some((link) => pathname === link.href || pathname.startsWith(link.href + "/"));
  const isUbkActive = pathname === "/ubk" || pathname.startsWith("/ubk/");
  const isBorangActive = pathname === "/borang" || pathname.startsWith("/borang/");

  const getLinkClass = (isActive: boolean) =>
    cn(
      "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 outline-none",
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50"
    >
      <AnnouncementBar />
      <header className="border-b border-border/90 bg-background">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <SchoolLogo className="size-11 sm:size-12" />
            <span className="flex flex-col leading-tight">
              <span className="font-heading text-sm sm:text-base font-semibold text-foreground">
                {SCHOOL_NAME}
              </span>
              <span className="hidden sm:block text-[11px] tracking-wide text-muted-foreground">
                {SCHOOL_TAGLINE}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-4 xl:gap-6 text-sm font-medium xl:flex">
            {/* 1. Utama */}
            <Link href="/" className={getLinkClass(isUtamaActive)}>
              Utama
            </Link>

            {/* 2. Tentang Kami */}
            <DropdownMenu>
              <DropdownMenuTrigger className={getLinkClass(isAboutActive) + " flex items-center gap-1.5 cursor-pointer"}>
                Tentang Kami
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ABOUT_LINKS.map((link) => {
                  const isLinkActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <DropdownMenuItem key={link.href} asChild className={cn(isLinkActive && "bg-muted font-medium")}>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. Berita & Galeri */}
            <DropdownMenu>
              <DropdownMenuTrigger className={getLinkClass(isNewsGalleryActive) + " flex items-center gap-1.5 cursor-pointer"}>
                Berita & Galeri
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {NEWS_GALLERY_LINKS.map((link) => {
                  const isLinkActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <DropdownMenuItem key={link.href} asChild className={cn(isLinkActive && "bg-muted font-medium")}>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 4. Asrama */}
            <DropdownMenu>
              <DropdownMenuTrigger className={getLinkClass(isAsramaActive) + " flex items-center gap-1.5 cursor-pointer"}>
                Asrama
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ASRAMA_LINKS.map((link) => {
                  const isLinkActive = pathname === link.href.split("?")[0];
                  return (
                    <DropdownMenuItem key={link.href} asChild className={cn(isLinkActive && "bg-muted font-medium")}>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 5. Pengurusan & Pentadbiran */}
            <DropdownMenu>
              <DropdownMenuTrigger className={getLinkClass(isManagementActive) + " flex items-center gap-1.5 cursor-pointer"}>
                Pengurusan & Pentadbiran
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MANAGEMENT_LINKS.map((link) => {
                  const isLinkActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <DropdownMenuItem key={link.href} asChild className={cn(isLinkActive && "bg-muted font-medium")}>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 6. UBK */}
            <Link href="/ubk" className={getLinkClass(isUbkActive)}>
              UBK
            </Link>

            {/* 7. Borang */}
            <Link href="/borang" className={getLinkClass(isBorangActive)}>
              Borang
            </Link>
          </nav>



          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="xl:hidden">
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
                  className={cn(
                    "text-base font-semibold transition-colors",
                    isUtamaActive ? "text-primary font-bold" : "text-foreground hover:text-primary"
                  )}
                >
                  Utama
                </Link>

                {/* Tentang Kami */}
                <div className="space-y-2">
                  <p className={cn(
                    "text-sm font-semibold tracking-wide uppercase transition-colors",
                    isAboutActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    Tentang Kami
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {ABOUT_LINKS.map((link) => {
                      const isLinkActive = pathname === link.href || pathname.startsWith(link.href + "/");
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            isLinkActive ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Berita & Galeri */}
                <div className="space-y-2">
                  <p className={cn(
                    "text-sm font-semibold tracking-wide uppercase transition-colors",
                    isNewsGalleryActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    Berita & Galeri
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {NEWS_GALLERY_LINKS.map((link) => {
                      const isLinkActive = pathname === link.href || pathname.startsWith(link.href + "/");
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            isLinkActive ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Asrama */}
                <div className="space-y-2">
                  <p className={cn(
                    "text-sm font-semibold tracking-wide uppercase transition-colors",
                    isAsramaActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    Asrama
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {ASRAMA_LINKS.map((link) => {
                      const isLinkActive = pathname === link.href.split("?")[0];
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            isLinkActive ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Pengurusan & Pentadbiran */}
                <div className="space-y-2">
                  <p className={cn(
                    "text-sm font-semibold tracking-wide uppercase transition-colors",
                    isManagementActive ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    Pengurusan & Pentadbiran
                  </p>
                  <div className="flex flex-col gap-2 pl-3 border-l border-border">
                    {MANAGEMENT_LINKS.map((link) => {
                      const isLinkActive = pathname === link.href || pathname.startsWith(link.href + "/");
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "text-sm font-medium transition-colors",
                            isLinkActive ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* UBK */}
                <Link
                  href="/ubk"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-base font-semibold transition-colors",
                    isUbkActive ? "text-primary font-bold" : "text-foreground hover:text-primary"
                  )}
                >
                  UBK
                </Link>

                {/* Borang */}
                <Link
                  href="/borang"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-base font-semibold transition-colors",
                    isBorangActive ? "text-primary font-bold" : "text-foreground hover:text-primary"
                  )}
                >
                  Borang
                </Link>

                <div className="pt-4 border-t border-border flex flex-col gap-3">
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
