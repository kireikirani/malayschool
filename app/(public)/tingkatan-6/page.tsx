import { UnitPage } from "@/components/public/unit-page";
import { UNITS } from "@/lib/units";

export default function Tingkatan6Page() {
  const unit = UNITS.find((u) => u.slug === "tingkatan-6")!;
  return <UnitPage unit={unit} />;
}
