"use client";

import { useEffect, useState } from "react";
import { FileText, FileImage, File, ExternalLink, FolderOpen, FolderX } from "lucide-react";

type JkDoc = {
  id: number;
  label: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc" | "link";
  tahun: string | null;
  isVisible: boolean;
  sortOrder: number;
};

function FileTypeIcon({ fileType }: { fileType: JkDoc["fileType"] }) {
  if (fileType === "image") return <FileImage className="size-4 shrink-0 text-blue-500" />;
  if (fileType === "link") return <ExternalLink className="size-4 shrink-0 text-emerald-500" />;
  if (fileType === "doc") return <File className="size-4 shrink-0 text-indigo-500" />;
  return <FileText className="size-4 shrink-0 text-red-500" />;
}

export function JkDocumentSection({
  unitSlug,
  jkCode,
  jkTitle,
}: {
  unitSlug: string;
  jkCode: string;
  jkTitle?: string | null;
}) {
  const [docs, setDocs] = useState<JkDoc[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`/api/unit-jk-docs?unitSlug=${encodeURIComponent(unitSlug)}&jkCode=${encodeURIComponent(jkCode)}&limit=100`)
      .then((res) => res.json())
      .then((body) => {
        if (Array.isArray(body.data)) {
          setDocs((body.data as JkDoc[]).filter((d) => d.isVisible));
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [unitSlug, jkCode]);

  if (!ready) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen className="size-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dokumen {jkTitle ?? "Jawatankuasa"}
        </span>
      </div>
      {docs.length === 0 ? (
        <div className="flex items-center gap-3 border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-muted-foreground">
          <FolderX className="size-4 shrink-0" />
          <span className="text-sm">Tiada dokumen dimuatkan buat masa ini.</span>
        </div>
      ) : (
        <div className="divide-y divide-border/50 border border-border/70 bg-card shadow-sm">
          {docs.map((doc) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group"
            >
              <FileTypeIcon fileType={doc.fileType} />
              <span className="flex-1 text-sm font-medium group-hover:text-primary transition-colors">
                {doc.label}
              </span>
              {doc.tahun && (
                <span className="text-xs text-muted-foreground shrink-0">{doc.tahun}</span>
              )}
              <ExternalLink className="size-3.5 text-muted-foreground/50 shrink-0 group-hover:text-primary/60 transition-colors" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
