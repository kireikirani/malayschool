import { UnitPage } from "@/components/public/unit-page";
import { UNITS } from "@/lib/units";

export default function HemPage() {
  const unit = UNITS.find((u) => u.slug === "hem")!;
  return <UnitPage unit={unit} />;
}
