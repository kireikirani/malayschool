import type { Metadata } from "next";
import { PageHeader } from "@/components/public/page-header";
import { PsikometrikSearch } from "@/components/public/psikometrik-search";

export const metadata: Metadata = {
  title: "Pelaporan Pentaksiran Psikometrik",
  description: "Semak keputusan pentaksiran psikometrik individu dengan memasukkan nombor pengenalan diri.",
};

export default function PsikometrikPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Unit Bimbingan & Kaunseling"
        title="Pelaporan Pentaksiran Psikometrik"
        description="Masukkan nombor pengenalan diri untuk melihat keputusan Inventori Tret Personaliti (ITP) anda."
      />
      <PsikometrikSearch />
    </div>
  );
}
