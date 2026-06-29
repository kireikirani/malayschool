import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/public/page-header";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { ASRAMA_DOCUMENT_CATEGORIES } from "@/lib/units";

export default function BorangPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Sistem Informasi & Hebahan"
        title="Borang & Dokumentasi Asrama"
        description="Akses terus folder dokumen pengurusan asrama dan sistem maklumat sekolah."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ASRAMA_DOCUMENT_CATEGORIES.map((category, i) => (
            <ScrollAnimation key={category} direction="up" delay={(i % 6) * 0.06}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4">
                  <span className="flex size-11 items-center justify-center border border-primary/15 bg-primary/8 text-primary">
                    <FolderOpen className="size-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold">{category}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Akses terus folder dokumen {category.toLowerCase()} secara langsung.
                    </p>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/contact">Hubungi Pejabat untuk Akses</Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Sistem ini sedang menjalani penambahbaikan berkala. Sebahagian pautan dokumen mungkin memerlukan
          pengesahan e-mel rasmi @moe-dl.edu.my sebelum diakses.
        </p>
      </div>
    </div>
  );
}
