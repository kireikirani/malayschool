export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AsramaStudentSubpage } from "./client-page";
import { PageHeader } from "@/components/public/page-header";
import { SCHOOL_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
