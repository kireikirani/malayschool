import type { LucideIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  visual?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  icon: Icon,
  visual,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <Empty
      className={cn(
        "border border-dashed border-border/70 bg-card text-foreground",
        compact ? "gap-3 p-8" : "gap-4 px-6 py-10 md:px-10 md:py-14",
        className,
      )}
    >
      <EmptyHeader className="max-w-xl">
        {visual ? (
          <div className="mb-2">{visual}</div>
        ) : Icon ? (
          <EmptyMedia variant="icon" className="border border-border/70 bg-muted text-foreground">
            <Icon />
          </EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent className="max-w-none">{action}</EmptyContent> : null}
    </Empty>
  );
}
