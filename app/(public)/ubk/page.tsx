import type { Metadata } from "next";
import { PsikometrikSearch } from "@/components/public/psikometrik-search";

export const metadata: Metadata = {
  title: "Pelaporan Pentaksiran Psikometrik",
  description: "Semak keputusan pentaksiran psikometrik individu dengan memasukkan nombor pengenalan diri.",
};

export default function UbkPage() {
  return <PsikometrikSearch />;
}
