export type UnitKpi = {
  label: string;
  value: number;
  suffix?: string;
};

export type UnitService = {
  title: string;
  desc: string;
};

export type Unit = {
  slug: string;
  navLabel: string;
  title: string;
  headName: string;
  headPosition: string;
  kpis: UnitKpi[];
};

export const UNIT_TAGLINE =
  "Membentuk sahsiah unggul dan kesejahteraan murid melalui pengurusan yang efisien, prihatin dan bersistematik selaras dengan matlamat sekolah.";

export const UNIT_SERVICES: UnitService[] = [
  { title: "Disiplin", desc: "Pengurusan tatatertib, salah laku dan pembentukan sahsiah mulia murid." },
  { title: "Kebajikan", desc: "Menguruskan bantuan kewangan, biasiswa dan keperluan asas pelajar asnaf." },
  { title: "Kaunseling", desc: "Bimbingan psikologi, kerjaya dan sokongan mental untuk kecemerlangan murid." },
  { title: "Asrama", desc: "Penyeliaan penginapan, keselamatan dan aktiviti penghuni asrama sekolah." },
];

export const UNIT_OPERATING_HOURS = [
  { label: "Isnin - Khamis", value: "7.30 Pagi - 2.00 Petang" },
  { label: "Jumaat", value: "7.30 Pagi - 12.00 Tengah Hari" },
  { label: "Cuti Umum & Hujung Minggu", value: "Tutup" },
];

export const UNITS: Unit[] = [
  {
    slug: "pentadbiran",
    navLabel: "Pengurusan Pentadbiran",
    title: "Unit Pengurusan & Pentadbiran",
    headName: "Puan Hanizam binti Kassim",
    headPosition: "Pengetua",
    kpis: [
      { label: "GPS SPM Sasaran 2026", value: 4.8 },
      { label: "Peratus LMS SPM", value: 96.05, suffix: "%" },
      { label: "Kehadiran Murid", value: 95.57, suffix: "%" },
      { label: "Pencapaian Kokurikulum & Sukan", value: 66.1, suffix: "%" },
    ],
  },
  {
    slug: "kurikulum",
    navLabel: "Kurikulum",
    title: "Unit Kurikulum",
    headName: "Encik Sharul Azman bin Jaafar",
    headPosition: "Penolong Kanan Kurikulum",
    kpis: [
      { label: "GPS SPM", value: 4.2 },
      { label: "LMS SPM", value: 92, suffix: "%" },
      { label: "Lulus Bahasa Melayu", value: 98, suffix: "%" },
      { label: "Lulus Sejarah", value: 95, suffix: "%" },
    ],
  },
  {
    slug: "hem",
    navLabel: "Hal Ehwal Murid",
    title: "Unit Hal Ehwal Murid (HEM)",
    headName: "Puan Norliza binti Jais",
    headPosition: "Penolong Kanan Hal Ehwal Murid",
    kpis: [
      { label: "Kehadiran Murid", value: 95.57, suffix: "%" },
      { label: "Salah Laku Jenayah Kekal", value: 0.8, suffix: "%" },
    ],
  },
  {
    slug: "kokurikulum",
    navLabel: "Kokurikulum",
    title: "Unit Kokurikulum",
    headName: "Puan Masroha binti Abu",
    headPosition: "Penolong Kanan Kokurikulum",
    kpis: [
      { label: "Pencapaian PAJSK", value: 3.6 },
      { label: "GPS PAJSK", value: 88, suffix: "%" },
      { label: "Pencapaian Cemerlang PAJSK", value: 66.1, suffix: "%" },
    ],
  },
  {
    slug: "tingkatan-6",
    navLabel: "Tingkatan 6",
    title: "Unit Tingkatan 6",
    headName: "Dr. Awaludin bin Ahmad",
    headPosition: "Penolong Kanan Tingkatan 6",
    kpis: [
      { label: "GPS STPM", value: 2.85 },
      { label: "Peratus Lulus", value: 100, suffix: "%" },
    ],
  },
];

export const ASRAMA_DOCUMENT_CATEGORIES = [
  "Pengurusan Dan Pentadbiran Asrama",
  "Pengurusan Data Asrama",
  "Pengurusan Kewangan Asrama",
  "Pengurusan Kepimpinan Murid Asrama",
  "Pengurusan Warden Asrama",
  "Pengurusan PT PO",
  "Pengurusan Program Asrama",
  "Pengurusan Dewan Makan Asrama",
  "Pengurusan Pembangunan Fizikal Asrama",
  "Lain-Lain Dokumentasi Asrama",
  "SISKA",
];
