"use client";

import dynamic from "next/dynamic";
import type { Step } from "react-joyride";
import { BookOpen, HelpCircle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TourTooltip } from "./tour-tooltip";
import { usePageTour } from "@/hooks/use-page-tour";

// Dynamic import — Joyride uses DOM APIs, must not run on the server.
const Joyride = dynamic(
  () => import("react-joyride").then((m) => m.Joyride),
  { ssr: false },
);

export function PageTour({ tourKey, steps }: { tourKey: string; steps: Step[] }) {
  const { run, stepIndex, autoEnabled, ready, startTour, toggleAuto, handleEvent } =
    usePageTour(tourKey);

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        scrollToFirstStep
        onEvent={handleEvent}
        tooltipComponent={TourTooltip}
        options={{
          buttons: ["back", "close", "primary"],
          overlayClickAction: false,
        }}
        styles={{
          overlay: { cursor: "default" },
        }}
      />

      {/* Manual start button */}
      {ready && !run && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={startTour}
              className="h-8 gap-1.5 text-xs"
            >
              <HelpCircle className="size-3.5" />
              Panduan
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Mulakan panduan penggunaan
          </TooltipContent>
        </Tooltip>
      )}

      {/* Auto-start toggle */}
      {ready && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={autoEnabled ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleAuto}
              className="h-8 gap-1.5 text-xs"
            >
              {autoEnabled ? (
                <>
                  <BookOpen className="size-3.5 text-primary" />
                  <span className="hidden sm:inline">Panduan: Hidup</span>
                </>
              ) : (
                <>
                  <BellOff className="size-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Panduan: Mati</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-52 text-xs">
            {autoEnabled
              ? "Panduan auto-mula setiap kali halaman ini dibuka. Klik untuk matikan."
              : "Panduan auto-mula dimatikan. Klik untuk hidupkan semula."}
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
