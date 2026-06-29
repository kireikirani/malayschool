import { UnitPage } from "@/components/public/unit-page";
import { UNITS } from "@/lib/units";

export default function PentadbiranPage() {
  const unit = UNITS.find((u) => u.slug === "pentadbiran")!;
  return <UnitPage unit={unit} />;
}
