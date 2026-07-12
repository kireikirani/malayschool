import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Link2, Network, Sparkles, Upload } from "lucide-react";
import type { ContentSection } from "@/lib/content";
import { FileCard } from "@/components/public/file-card";
import { UnitDocumentsList } from "@/components/public/unit-documents-list";
import { DocumentPortal } from "@/components/public/document-portal";
import { MarkdownContent } from "@/components/public/markdown-content";
import { Button } from "@/components/ui/button";

function SectionHeading({
  title,
  subtitle,
}: {
  title?: string | null;
  subtitle?: string | null;
}) {
  if (!title && !subtitle) return null;

  return (
    <div className="mb-6">
      {title ? <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2> : null}
      {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function EmptyFileState() {
  return (
    <div className="flex items-center justify-between border border-dashed border-border/70 bg-muted/30 px-5 py-4">
      <div>
        <p className="text-sm font-medium">Fail belum dimuat naik</p>
        <p className="text-xs text-muted-foreground">Admin boleh memuat naik fail melalui dashboard.</p>
      </div>
      <Upload className="size-6 text-primary shrink-0" />
    </div>
  );
}

export function ContentSectionRenderer({ section }: { section: ContentSection }) {
  if (!section.isActive) return null;

  if (section.sectionKey === "log-harian-pengetua" || (section.type === "text_block" && section.linkUrl?.includes("canva.site"))) {
    return (
      <section className="relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-md p-8 text-center text-white md:p-14">
        <Image
          src="/gallery/sekolah/bangunan-sekolah.jpg"
          alt=""
          fill
          className="object-cover object-[78%_40%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-primary/70 mix-blend-color" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/50" />

        <div className="relative z-10 flex max-w-2xl flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            <Sparkles className="size-3" aria-hidden />
            Created by Cikgu Hannani and Cikgu Hasyrul
          </span>
          <h2 className="mb-4 font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
            {section.title || "Log Harian Pengetua"}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-white/85 drop-shadow-sm md:text-base">
            {section.body || "Akses dan semak maklumat log harian, perancangan strategik, takwim pengurusan, serta pelan pentadbiran pengetua sekolah secara interaktif melalui paparan Canva."}
          </p>
          <Button
            asChild
            className="h-11 rounded-full bg-white px-8 font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
          >
            <a
              href={section.linkUrl || "https://pengurusandanpentadbiran.my.canva.site/plannerpengetua"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {section.linkLabel || "Buka Log Harian Pengetua"}
            </a>
          </Button>
        </div>
      </section>
    );
  }

  if (section.type === "text_block") {
    return (
      <section className="bg-card px-6 py-6 shadow-sm">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        {section.body ? (
          <MarkdownContent
            markdown={section.body}
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary hover:prose-a:underline"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Kandungan akan dikemaskini.</p>
        )}
      </section>
    );
  }

  if (section.type === "stats") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item) => (
            <div key={`${section.sectionKey}-${item.sortOrder}`} className="flex flex-col items-center justify-center bg-card px-5 py-6 text-center shadow-sm">
              <p className="font-heading text-3xl font-semibold text-primary md:text-4xl">{item.value ?? "--"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label ?? item.title}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "poster") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        {section.imageUrl ? (
          <div className="relative overflow-hidden border border-border/70 bg-card">
            <div className="relative aspect-[4/3] w-full">
              <Image src={section.imageUrl} alt={section.title ?? section.sectionKey} fill className="object-contain" />
            </div>
          </div>
        ) : (
          <div className="flex min-h-64 items-center justify-center border border-dashed border-border/70 bg-muted/30 text-center">
            <div>
              <Network className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium">Poster / carta belum tersedia</p>
              <p className="text-xs text-muted-foreground">Admin boleh memuat naik imej kemudian.</p>
            </div>
          </div>
        )}
      </section>
    );
  }

  if (section.type === "quick_links") {
    return (
      <section className="bg-card px-6 py-6 shadow-sm">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-3 sm:grid-cols-2">
          {section.items.map((item) => (
            <Link
              key={`${section.sectionKey}-${item.sortOrder}`}
              href={item.url || "#"}
              className="flex items-center justify-between bg-muted/30 px-4 py-3 text-sm hover:bg-muted/60"
            >
              <span className="flex items-center gap-2">
                <Link2 className="size-4 text-primary" />
                {item.title ?? item.label}
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "simple_table" || section.type === "jk_table") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className={section.imageUrl ? "grid gap-6 md:grid-cols-[240px_1fr] md:items-start" : ""}>
          {section.imageUrl ? (
            <div className="overflow-hidden border border-border/70 bg-muted">
              <div className="relative aspect-square w-full">
                <Image src={section.imageUrl} alt={section.title ?? section.sectionKey} fill className="object-contain p-4" />
              </div>
            </div>
          ) : null}
          <div className="overflow-x-auto bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    {section.type === "jk_table" ? "Nama" : "Perkara"}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                    {section.type === "jk_table" ? "Jawatan" : "Keterangan"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => (
                  <tr key={`${section.sectionKey}-${item.sortOrder}`} className="border-b border-border/40 last:border-0">
                    <td className="px-5 py-3 font-medium">{item.title ?? item.label}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.value ?? item.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "card_grid" || section.type === "gallery") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item) => (
            <div key={`${section.sectionKey}-${item.sortOrder}`} className="flex flex-col bg-card p-5 shadow-sm">
              {item.imageUrl ? (
                <div className="relative mb-4 aspect-video overflow-hidden bg-muted">
                  <Image src={item.imageUrl} alt={item.title ?? item.label ?? "Section image"} fill className="object-cover" />
                </div>
              ) : null}
              {item.label ? <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.label}</p> : null}
              {item.title ? <h3 className="mt-1 font-heading text-lg font-semibold">{item.title}</h3> : null}
              {item.value ? <p className="mt-1 text-sm font-medium text-primary">{item.value}</p> : null}
              {item.body ? <p className="mt-2 text-sm text-muted-foreground">{item.body}</p> : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "file_list") {
    if (section.unitSlug) {
      return (
        <DocumentPortal
          unitSlug={section.unitSlug}
          title={section.title}
          subtitle={section.subtitle}
        />
      );
    }
    return (
      <UnitDocumentsList
        items={section.items}
        title={section.title}
        subtitle={section.subtitle}
      />
    );
  }

  return null;
}
