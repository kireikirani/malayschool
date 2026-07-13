import { ExternalLink, FolderOpen } from "lucide-react";

function extractDriveFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

export function GDriveFolderEmbed({
  url,
  title,
}: {
  url: string;
  title?: string | null;
  subtitle?: string | null;
}) {
  const folderId = extractDriveFolderId(url);
  if (!folderId) return null;

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
  const openUrl = `https://drive.google.com/drive/folders/${folderId}`;
  const portalTitle = (title ?? "PORTAL DOKUMEN").toUpperCase();

  return (
    <div className="w-full flex flex-col border border-border bg-card shadow-lg rounded-lg overflow-hidden min-h-[620px]">
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border bg-muted/30 px-5 py-4 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FolderOpen className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold tracking-tight text-foreground uppercase">
              {portalTitle}
            </h2>
            <p className="text-[11px] text-muted-foreground font-sans">
              Google Drive Cloud File Integration
            </p>
          </div>
        </div>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          Buka di Drive
          <ExternalLink className="size-3.5" />
        </a>
      </div>
      <iframe
        src={embedUrl}
        className="flex-1 min-h-[620px] w-full border-0 bg-background"
        title={title ?? "Google Drive folder"}
        loading="lazy"
      />
    </div>
  );
}

export { extractDriveFolderId };
