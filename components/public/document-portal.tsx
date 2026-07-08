"use client";

import { DocumentExplorer } from "./document-explorer";

export function DocumentPortal({
  unitSlug,
  title,
  subtitle,
}: {
  unitSlug: string;
  title?: string | null;
  subtitle?: string | null;
}) {
  return (
    <div className="space-y-4">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <DocumentExplorer 
        scopedUnitSlug={unitSlug} 
        title={`PORTAL DOKUMEN ${unitSlug.toUpperCase()}`} 
      />
    </div>
  );
}
