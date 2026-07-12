"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FolderOpen, Search, X, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileCard } from "@/components/public/file-card";

type UnitDoc = {
  id: number;
  unitSlug: string;
  label: string | null;
  fileUrl: string | null;
};

type UnitMeta = {
  slug: string;
  navLabel: string;
};

export function BorangClient({
  categories,
  uploadedUnitDocs,
  units,
}: {
  categories: string[];
  uploadedUnitDocs: UnitDoc[];
  units: UnitMeta[];
}) {
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();

  // Filter category cards
  const filteredCategories = useMemo(
    () => (q ? categories.filter((c) => c.toLowerCase().includes(q)) : categories),
    [categories, q]
  );

  // Filter unit docs & units that still have matching docs
  const filteredUnits = useMemo(() => {
    return units
      .map((unit) => {
        const docs = uploadedUnitDocs.filter(
          (doc) =>
            doc.unitSlug === unit.slug &&
            (!q || (doc.label || "").toLowerCase().includes(q))
        );
        return { ...unit, docs };
      })
      .filter((unit) => !q || unit.docs.length > 0 || unit.navLabel.toLowerCase().includes(q));
  }, [units, uploadedUnitDocs, q]);

  const hasAnyResult =
    filteredCategories.length > 0 ||
    filteredSchoolDocs.length > 0 ||
    filteredUnits.some((u) => u.docs.length > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:py-16">

      {/* ── Search Bar ─────────────────────────────────────────────────────── */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kategori, nama fail atau unit..."
          className="h-11 pl-10 pr-10 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ── No results ─────────────────────────────────────────────────────── */}
      {q && !hasAnyResult && (
        <div className="flex flex-col items-center justify-center border border-dashed border-border/70 bg-muted/10 py-16 text-center">
          <FileText className="size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">Tiada dokumen dijumpai</p>
          <p className="text-xs text-muted-foreground">
            Cuba kata kunci lain untuk mencari kategori atau fail.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => setSearch("")}
          >
            Padam Carian
          </Button>
        </div>
      )}

      {/* ── Category Cards ─────────────────────────────────────────────────── */}
      {filteredCategories.length > 0 && (
        <section>
          {q && (
            <p className="mb-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              Kategori ({filteredCategories.length})
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {filteredCategories.map((category, i) => (
              <Card key={category} className="h-full">
                <CardContent className="flex h-full flex-col gap-4">
                  <FolderOpen className="size-7 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold">{category}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kategori dokumentasi asrama untuk hebahan dan rujukan dalaman.
                    </p>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/contact">Hubungi Pejabat untuk Akses</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Dokumen Unit
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fail PDF atau dokumen yang dimuat naik mengikut unit pengurusan sekolah.
          </p>
        </div>
        <div className="space-y-8">
          {filteredUnits.map((unit) => (
            <div key={unit.slug}>
              <h3 className="mb-3 font-heading text-lg font-semibold">{unit.navLabel}</h3>
              {unit.docs.length === 0 ? (
                <div className="border border-dashed border-border/70 bg-muted/30 px-6 py-6 text-sm text-muted-foreground">
                  {q
                    ? `Tiada dokumen sepadan dengan "${search}" untuk unit ini.`
                    : "Belum ada dokumen dimuat naik untuk unit ini."}
                </div>
              ) : (
                <div className="space-y-4">
                  {unit.docs.map((doc) => (
                    doc.fileUrl ? (
                      <FileCard
                        key={doc.id}
                        name={doc.label ?? doc.fileUrl}
                        url={doc.fileUrl}
                        showTable={false}
                      />
                    ) : (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 border border-dashed border-border/60 bg-muted/20 px-5 py-4"
                      >
                        <FileText className="size-5 shrink-0 text-muted-foreground/50" />
                        <div>
                          <p className="text-sm font-medium">{doc.label}</p>
                          <p className="text-xs text-muted-foreground">Fail belum dimuat naik</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
