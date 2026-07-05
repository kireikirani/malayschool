import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guru & Staf",
  description: "Direktori guru dan staf SMK Telok Panglima Garang.",
};

export default function TeachersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
