import { UnitPage } from "@/components/public/unit-page";
import { UNITS } from "@/lib/units";

export default function UbkPage() {
  const unit = UNITS.find((u) => u.slug === "ubk")!;
  return <UnitPage unit={unit} />;
}
