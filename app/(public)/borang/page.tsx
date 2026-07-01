import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { FolderOpen } from "lucide-react";
import { db } from "@/lib/db";
import { media, unitDocuments } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/public/page-header";
import { ScrollAnimation } from "@/components/ui/scroll-animation";
import { FileCard } from "@/components/public/file-card";
import { ASRAMA_DOCUMENT_CATEGORIES, UNITS } from "@/lib/units";

export default async function BorangPage() {
  const [schoolDocs, uploadedUnitDocs] = await Promise.all([
    db.select().from(media).where(eq(media.folder, "documents")).orderBy(desc(media.uploadedAt)).limit(6),
    db.select().from(unitDocuments).where(eq(unitDocuments.type, "dokumen")).orderBy(asc(unitDocuments.unitSlug), asc(unitDocuments.sortOrder)),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Sistem Informasi & Hebahan"
        title="Borang & Dokumentasi Asrama"
        description="Akses terus dokumen pengurusan asrama, dokumen unit, dan fail rasmi sekolah."
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:py-16">
        <section>
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
                      <p className="mt-1 text-sm text-muted-foreground">Kategori dokumentasi asrama untuk hebahan dan rujukan dalaman.</p>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/contact">Hubungi Pejabat untuk Akses</Link>
                    </Button>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Dokumen Sekolah</h2>
            <p className="mt-2 text-sm text-muted-foreground">Dokumen umum yang telah dimuat naik melalui dashboard admin.</p>
          </div>
          <div className="space-y-4">
            {schoolDocs.length === 0 ? (
              <div className="border border-dashed border-border/70 bg-muted/30 px-6 py-8 text-center text-sm text-muted-foreground">
                Belum ada dokumen sekolah dimuat naik.
              </div>
            ) : (
              schoolDocs.map((doc) => <FileCard key={doc.id} name={doc.fileName} url={doc.filePath} size={doc.fileSize} showTable={false} />)
            )}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">Dokumen Unit</h2>
            <p className="mt-2 text-sm text-muted-foreground">Fail PDF atau dokumen yang dimuat naik mengikut unit pengurusan sekolah.</p>
          </div>
          <div className="space-y-8">
            {UNITS.map((unit) => {
              const docs = uploadedUnitDocs.filter((doc) => doc.unitSlug === unit.slug);
              return (
                <div key={unit.slug}>
                  <h3 className="mb-3 font-heading text-lg font-semibold">{unit.navLabel}</h3>
                  {docs.length === 0 ? (
                    <div className="border border-dashed border-border/70 bg-muted/30 px-6 py-6 text-sm text-muted-foreground">
                      Belum ada dokumen dimuat naik untuk unit ini.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {docs.map((doc) => (
                        <FileCard key={doc.id} name={doc.label} url={doc.fileUrl} showTable={false} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
