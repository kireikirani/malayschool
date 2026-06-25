import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Diterbitkan",
  active: "Aktif",
  inactive: "Nonaktif",
};

const VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  published: "default",
  active: "default",
  inactive: "secondary",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={VARIANTS[status] ?? "outline"}>{LABELS[status] ?? status}</Badge>;
}
