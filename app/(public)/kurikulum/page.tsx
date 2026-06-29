import { UnitPage } from "@/components/public/unit-page";
import { UNITS } from "@/lib/units";

export default function KurikulumPage() {
  const unit = UNITS.find((u) => u.slug === "kurikulum")!;
  return <UnitPage unit={unit} />;
}
