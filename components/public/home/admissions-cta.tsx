import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdmissionsCta() {
  return (
    <section className="border-y border-border/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="overflow-hidden border border-border/70 bg-card px-6 py-14 text-center shadow-[0_24px_60px_-44px_rgba(35,24,16,0.5)] md:px-12 md:py-20">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase">Dokumen Sekolah</span>
          <h2 className="mx-auto mt-3 max-w-xl font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Akses Borang, Jadual, dan Data Rasmi Sekolah
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Semua dokumen dipaparkan daripada upload admin, termasuk fail Excel yang boleh
            terus dibaca sebagai jadual di laman ini.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="border border-gold/40 bg-gold/20 text-gold-foreground hover:bg-gold/30">
              <Link href="/dokumen-sekolah">
                Lihat Dokumen
                <ArrowRight />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-border/80 bg-transparent text-foreground hover:bg-muted"
            >
              <Link href="/contact">
                <Phone />
                Hubungi Pejabat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
