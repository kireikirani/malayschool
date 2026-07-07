"use client";

import type { TooltipRenderProps } from "react-joyride";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TourTooltip({
  continuous,
  index,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="relative w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background shadow-xl"
    >
      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-t-lg bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((index + 1) / size) * 100}%` }}
        />
      </div>

      <div className="p-4">
        {/* Close — hides tour for this visit only */}
        <button
          {...closeProps}
          className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-sm text-muted-foreground opacity-60 hover:opacity-100"
          aria-label="Tutup panduan"
        >
          <X className="size-3.5" />
        </button>

        {/* Step counter */}
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
          Langkah {index + 1} / {size}
        </p>

        {/* Title */}
        {step.title && (
          <h3 className="mb-1.5 pr-6 text-sm font-semibold leading-snug text-foreground">
            {step.title as string}
          </h3>
        )}

        {/* Content */}
        <div className="text-xs leading-relaxed text-muted-foreground">
          {step.content}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end gap-2">
          {index > 0 && (
            <Button
              {...backProps}
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
            >
              <ChevronLeft className="size-3" />
              Sebelum
            </Button>
          )}
          {continuous ? (
            <Button
              {...primaryProps}
              size="sm"
              className={cn("h-7 gap-1 text-xs")}
            >
              {index === size - 1 ? (
                "Selesai"
              ) : (
                <>
                  Seterusnya
                  <ChevronRight className="size-3" />
                </>
              )}
            </Button>
          ) : (
            <Button {...closeProps} size="sm" className="h-7 text-xs">
              Faham
            </Button>
          )}
        </div>

        {/* Hint — direct user to the toggle button */}
        <p className="mt-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground/60">
          Panduan ini akan muncul semula setiap kali halaman ini dibuka.
          Gunakan butang <span className="font-medium">Panduan</span> di atas untuk matikan.
        </p>
      </div>
    </div>
  );
}
