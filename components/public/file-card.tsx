import { Suspense } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, getFileTypeInfo, isDocumentLink } from "@/lib/file-type";
import { DocumentPreview } from "@/components/public/document-preview";

function FileTypeIcon({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function FileCard({
  name,
  url,
  size,
  showTable = true,
}: {
  name: string;
  url: string;
  size?: number | null;
  /** Render the spreadsheet's contents as a table beneath the card for .xlsx/.xls files. */
  showTable?: boolean;
}) {
  const { iconSvg, label, colorClass } = getFileTypeInfo(name || url);
  const formattedSize = formatFileSize(size);
  const isDocument = isDocumentLink(name || url);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 border border-border/70 bg-card p-4 shadow-[0_18px_40px_-34px_rgba(35,24,16,0.45)]">
        <span
          className={`flex size-12 shrink-0 items-center justify-center border border-border/60 ${colorClass}`}
        >
          <FileTypeIcon svg={iconSvg} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {label}
            {formattedSize && ` · ${formattedSize}`}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href={url} target="_blank" rel="noopener noreferrer" download>
            <Download />
            Muat Turun
          </Link>
        </Button>
      </div>

      {isDocument && showTable && (
        <Suspense fallback={<div className="h-32 animate-pulse border border-border/70 bg-muted" />}>
          <DocumentPreview url={url} />
        </Suspense>
      )}
    </div>
  );
}
