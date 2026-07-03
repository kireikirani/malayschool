export const dynamic = "force-dynamic";

import { AsramaStudentSubpage } from "./client-page";
import { PageHeader } from "@/components/public/page-header";
import { SCHOOL_NAME } from "@/lib/brand";

export default function StudentListPage() {
  return (
    <div>
      <PageHeader
        eyebrow={SCHOOL_NAME}
        title="Senarai Pelajar"
        description="Akses terhad untuk maklumat penghuni asrama"
      />
      <AsramaStudentSubpage />
    </div>
  );
}
