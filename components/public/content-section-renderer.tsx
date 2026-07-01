import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Link2, Network, Upload } from "lucide-react";
import type { ContentSection } from "@/lib/content";
import { FileCard } from "@/components/public/file-card";

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
      <span className="flex size-10 items-center justify-center bg-primary/8 text-primary">
        <Upload className="size-4" />
      </span>
    </div>
  );
}

export function ContentSectionRenderer({ section }: { section: ContentSection }) {
  if (!section.isActive) return null;

  if (section.type === "text_block") {
    return (
      <section className="border border-border/70 bg-card px-6 py-6">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        {section.body ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">{section.body}</pre>
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
            <div key={`${section.sectionKey}-${item.sortOrder}`} className="border border-border/70 bg-card px-5 py-6 text-center">
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
      <section className="border border-border/70 bg-card px-6 py-6">
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-3 sm:grid-cols-2">
          {section.items.map((item) => (
            <Link
              key={`${section.sectionKey}-${item.sortOrder}`}
              href={item.url || "#"}
              className="flex items-center justify-between border border-border/70 px-4 py-3 text-sm hover:bg-muted/40"
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
        {section.imageUrl ? (
          <div className="mb-6 flex justify-center">
            <div className="relative aspect-[3/2] w-52 overflow-hidden border border-border/70 bg-card">
              <Image src={section.imageUrl} alt={section.title ?? section.sectionKey} fill className="object-contain" />
            </div>
          </div>
        ) : null}
        <div className="overflow-x-auto border border-border/70 bg-card">
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
      </section>
    );
  }

  if (section.type === "card_grid" || section.type === "gallery") {
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item) => (
            <div key={`${section.sectionKey}-${item.sortOrder}`} className="border border-border/70 bg-card p-5">
              {item.imageUrl ? (
                <div className="relative mb-4 aspect-video overflow-hidden border border-border/60 bg-muted">
                  <Image src={item.imageUrl} alt={item.title ?? item.label ?? "Section image"} fill className="object-cover" />
                </div>
              ) : null}
              {item.label ? <p className="text-xs font-semibold tracking-wide text-primary uppercase">{item.label}</p> : null}
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
    return (
      <section>
        <SectionHeading title={section.title} subtitle={section.subtitle} />
        <div className="space-y-4">
          {section.items.map((item) =>
            item.fileUrl ? (
              <FileCard
                key={`${section.sectionKey}-${item.sortOrder}`}
                name={item.title ?? item.label ?? "Dokumen"}
                url={item.fileUrl}
                showTable={false}
              />
            ) : (
              <div key={`${section.sectionKey}-${item.sortOrder}`} className="space-y-2">
                <div className="flex items-start gap-4 border border-border/70 bg-card px-5 py-4">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center bg-primary/8 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title ?? item.label}</p>
                    {item.body ? <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p> : null}
                  </div>
                </div>
                <EmptyFileState />
              </div>
            ),
          )}
        </div>
      </section>
    );
  }

  return null;
}
