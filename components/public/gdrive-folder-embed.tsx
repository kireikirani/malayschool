import { ExternalLink } from "lucide-react";

function extractDriveFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

export function GDriveFolderEmbed({
  url,
  title,
  subtitle,
}: {
  url: string;
  title?: string | null;
  subtitle?: string | null;
}) {
  const folderId = extractDriveFolderId(url);
  if (!folderId) return null;

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  const openUrl = `https://drive.google.com/drive/folders/${folderId}`;

  return (
    <section className="space-y-4">
      {(title || subtitle) && (
        <div>
          {title && <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-border/70 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2 text-sm">
          <span className="font-medium text-foreground">Portal Dokumen Google Drive</span>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Buka di Drive
            <ExternalLink className="size-3.5" />
          </a>
        </div>
        <iframe
          src={embedUrl}
          className="h-[600px] w-full border-0"
          title={title ?? "Google Drive folder"}
          loading="lazy"
        />
      </div>
    </section>
  );
}

export { extractDriveFolderId };
