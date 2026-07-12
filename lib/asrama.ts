import type { LucideIcon } from "lucide-react";
import { BedDouble, Utensils, BookOpen, Landmark, Trophy, Shirt, Wifi, ShieldCheck } from "lucide-react";

export type JkAsramaMember = {
  name: string;
  jawatan: string;
};

export type AsramaFasiliti = {
  icon: LucideIcon;
  label: string;
};

export const ASRAMA_STATS = {
  pelajarLelaki: 280,
  pelajarPerempuan: 320,
  jumlahPelajar: 600,
  jumlahWarden: 12,
  blok: 4,
  kapasitiBilik: 150,
};

export const JK_ASRAMA: JkAsramaMember[] = [
  { name: "Puan Norhaiza binti Ahmad", jawatan: "Pengerusi" },
  { name: "Encik Zaharudin bin Hassan", jawatan: "Timbalan Pengerusi" },
  { name: "Puan Siti Aisyah binti Mahmud", jawatan: "Setiausaha" },
  { name: "Encik Hafizuddin bin Mokhtar", jawatan: "Bendahari" },
  { name: "Puan Rohani binti Kamarudin", jawatan: "AJK" },
  { name: "Encik Azlan bin Sulaiman", jawatan: "AJK" },
  { name: "Puan Faridah binti Osman", jawatan: "AJK" },
  { name: "Encik Khairul Azri bin Jamaludin", jawatan: "AJK" },
];

export const ASRAMA_FASILITI: AsramaFasiliti[] = [
  { icon: BedDouble, label: "Bilik Tidur Sistematik" },
  { icon: Utensils, label: "Dewan Makan" },
  { icon: BookOpen, label: "Bilik Belajar" },
  { icon: Landmark, label: "Surau" },
  { icon: Trophy, label: "Padang Sukan" },
  { icon: Shirt, label: "Bilik Dobi" },
  { icon: Wifi, label: "Wi-Fi Percuma" },
  { icon: ShieldCheck, label: "CCTV 24 Jam" },
];
