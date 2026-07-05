import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita & Pengumuman",
  description: "Berita terkini, pengumuman, dan aktiviti SMK Telok Panglima Garang.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
