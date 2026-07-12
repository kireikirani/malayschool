"use client";

import { useState } from "react";
import { SCHOOL_LOGO_URL, SCHOOL_SHORT_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function SchoolLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-t-2xl rounded-b-md bg-primary text-xs font-heading font-semibold text-primary-foreground",
          className,
        )}
      >
        {SCHOOL_SHORT_NAME.replace("SMK ", "")}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external crest URL, optimization not required for a small logo
    <img
      src={SCHOOL_LOGO_URL}
      alt={SCHOOL_SHORT_NAME}
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-md object-contain", className)}
    />
  );
}
