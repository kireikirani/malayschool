import { UnitPage } from "@/components/public/unit-page";
import { UNITS } from "@/lib/units";

export default function KokurikulumPage() {
  const unit = UNITS.find((u) => u.slug === "kokurikulum")!;
  return <UnitPage unit={unit} />;
}
