export type UnitKpi = {
  label: string;
  value: number;
  suffix?: string;
};

export type UnitService = {
  title: string;
  desc: string;
};

export type JkMember = {
  name: string;
  jawatan: string;
};

export type JkTable = {
  title: string;
  members: JkMember[];
};

export type UnitDokumen = {
  label: string;
  desc?: string;
};

export type UnitPencapaian = {
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
  jkTables?: JkTable[];
  dokumen?: UnitDokumen[];
  pencapaian?: UnitPencapaian[];
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
    jkTables: [
      {
        title: "JK Pengurusan & Pentadbiran",
        members: [
          { name: "Puan Hanizam binti Kassim", jawatan: "Pengerusi (Pengetua)" },
          { name: "Encik Sharul Azman bin Jaafar", jawatan: "Timbalan Pengerusi" },
          { name: "Puan Norliza binti Jais", jawatan: "Ahli" },
          { name: "Puan Masroha binti Abu", jawatan: "Ahli" },
          { name: "Dr. Awaludin bin Ahmad", jawatan: "Ahli" },
          { name: "Puan Sarimah binti Mohd Noor", jawatan: "Setiausaha" },
        ],
      },
    ],
    dokumen: [
      { label: "Log Harian Pengurusan", desc: "Rekod harian aktiviti pengurusan sekolah" },
      { label: "Hala Tuju 2026-2030", desc: "Pelan strategik pembangunan sekolah 5 tahun" },
      { label: "Pelan Strategik Organisasi", desc: "Pelan pembangunan organisasi sekolah" },
      { label: "Pekeliling Pengetua", desc: "Pekeliling dan surat arahan daripada pengetua" },
      { label: "Pekeliling Kokurikulum", desc: "Pekeliling berkaitan aktiviti kokurikulum" },
      { label: "Pekeliling Pengurusan & Pentadbiran", desc: "Pekeliling berkaitan pengurusan am sekolah" },
      { label: "Minit Mesyuarat Pengurusan", desc: "Minit mesyuarat jawatankuasa pengurusan sekolah" },
      { label: "Minit Mesyuarat Kewangan", desc: "Minit mesyuarat pengurusan kewangan sekolah" },
      { label: "Laporan Kewangan Bulanan", desc: "Laporan pendapatan dan perbelanjaan bulanan" },
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
    pencapaian: [
      {
        title: "Program Nilam",
        desc: "Program membaca dan merekod buku untuk memupuk tabiat membaca dalam kalangan murid.",
      },
      {
        title: "Program Pemulihan & Pengayaan",
        desc: "Sokongan akademik tambahan untuk murid yang memerlukan bimbingan khusus dalam mata pelajaran teras.",
      },
      {
        title: "Program Kepimpinan Akademik",
        desc: "Bengkel dan seminar untuk meningkatkan kemahiran belajar dan kepimpinan akademik murid.",
      },
    ],
    jkTables: [
      {
        title: "JM21 — Jawatankuasa Pengurusan Kurikulum",
        members: [
          { name: "Encik Sharul Azman bin Jaafar", jawatan: "Pengerusi" },
          { name: "Puan Norlaili binti Abd Aziz", jawatan: "Setiausaha" },
          { name: "Encik Fadzillah bin Ismail", jawatan: "Ketua Panitia BM" },
          { name: "Puan Hajah Rohaya binti Mokhtar", jawatan: "Ketua Panitia Matematik" },
          { name: "Encik Rizal bin Ahmad", jawatan: "Ketua Panitia Sains" },
          { name: "Puan Mazlina binti Yusof", jawatan: "AJK" },
        ],
      },
      {
        title: "JM22 — Jawatankuasa Panitia Mata Pelajaran",
        members: [
          { name: "Encik Fadzillah bin Ismail", jawatan: "Penyelaras Panitia BM" },
          { name: "Puan Hajah Rohaya binti Mokhtar", jawatan: "Penyelaras Panitia Matematik" },
          { name: "Encik Rizal bin Ahmad", jawatan: "Penyelaras Panitia Sains" },
          { name: "Puan Norlaili binti Abd Aziz", jawatan: "Penyelaras Panitia Sejarah" },
          { name: "Puan Salmah binti Osman", jawatan: "Penyelaras Panitia Bahasa Inggeris" },
          { name: "Encik Mohd Yazid bin Hamdan", jawatan: "Penyelaras Panitia Pendidikan Islam" },
        ],
      },
      {
        title: "JM23 — Jawatankuasa Pentaksiran dan Peperiksaan / JK PBS",
        members: [
          { name: "Encik Sharul Azman bin Jaafar", jawatan: "Pengerusi" },
          { name: "Puan Norlaili binti Abd Aziz", jawatan: "Ketua Peperiksaan" },
          { name: "Encik Fadzillah bin Ismail", jawatan: "Timbalan Ketua" },
          { name: "Puan Salmah binti Osman", jawatan: "Setiausaha PBS" },
          { name: "Encik Mohd Yazid bin Hamdan", jawatan: "AJK" },
        ],
      },
      {
        title: "JM24 — Jawatankuasa Pusat Sumber Sekolah",
        members: [
          { name: "Puan Faizah binti Abdul Rahim", jawatan: "Guru Perpustakaan & Media" },
          { name: "Encik Zulkarnain bin Mustapha", jawatan: "Penolong GPM" },
          { name: "Puan Haslinda binti Hamzah", jawatan: "AJK" },
          { name: "Encik Hairul Anwar bin Zainal", jawatan: "AJK" },
        ],
      },
    ],
    dokumen: [
      { label: "Jadual Peperiksaan Dalaman 2026", desc: "Jadual peperiksaan pertengahan dan akhir tahun" },
      { label: "Jadual Peperiksaan SPM 2026", desc: "Jadual rasmi peperiksaan SPM daripada Lembaga Peperiksaan" },
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
    pencapaian: [
      {
        title: "Program Bimbingan & Kaunseling",
        desc: "Sesi bimbingan individu dan kumpulan untuk membantu murid menghadapi cabaran akademik dan sosial.",
      },
      {
        title: "Program Disiplin Positif",
        desc: "Pendekatan pembentukan sahsiah melalui program berstruktur dan aktiviti pemupukan nilai murni.",
      },
      {
        title: "Program Kebajikan Murid",
        desc: "Bantuan kewangan, biasiswa dan sokongan keperluan asas untuk murid yang memerlukan.",
      },
    ],
    jkTables: [
      {
        title: "Jawatankuasa Hal Ehwal Murid",
        members: [
          { name: "Puan Norliza binti Jais", jawatan: "Pengerusi (GPK HEM)" },
          { name: "Puan Azlinah binti Abdul Latif", jawatan: "Guru Disiplin Kanan" },
          { name: "Encik Mohd Hafiz bin Nordin", jawatan: "Guru Disiplin" },
          { name: "Puan Nurulhuda binti Hassan", jawatan: "Guru Kaunseling" },
          { name: "Encik Suhaimi bin Zainuddin", jawatan: "Guru Kebajikan" },
          { name: "Puan Asma binti Che Mat", jawatan: "Setiausaha HEM" },
        ],
      },
      {
        title: "Jawatankuasa Disiplin Sekolah",
        members: [
          { name: "Puan Azlinah binti Abdul Latif", jawatan: "Pengerusi" },
          { name: "Encik Mohd Hafiz bin Nordin", jawatan: "Timbalan Pengerusi" },
          { name: "Puan Asma binti Che Mat", jawatan: "Setiausaha" },
          { name: "Encik Suhaimi bin Zainuddin", jawatan: "AJK" },
          { name: "Puan Faridah binti Osman", jawatan: "AJK" },
        ],
      },
      {
        title: "Jawatankuasa Kaunseling & Bimbingan",
        members: [
          { name: "Puan Nurulhuda binti Hassan", jawatan: "Pengerusi" },
          { name: "Puan Asma binti Che Mat", jawatan: "Setiausaha" },
          { name: "Puan Azlinah binti Abdul Latif", jawatan: "AJK" },
          { name: "Encik Mohd Hafiz bin Nordin", jawatan: "AJK" },
        ],
      },
    ],
    dokumen: [
      { label: "Carta Organisasi HEM", desc: "Poster atau struktur organisasi unit HEM" },
      { label: "KPI Hal Ehwal Murid", desc: "Ringkasan sasaran dan pencapaian KPI HEM" },
      { label: "Program Sahsiah Murid", desc: "Dokumen atau poster aktiviti pembangunan sahsiah" },
      { label: "Hebahan Disiplin", desc: "Bahan rujukan dan hebahan disiplin murid" },
      { label: "Bimbingan & Kaunseling", desc: "Dokumen program kaunseling dan kebajikan murid" },
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
    pencapaian: [
      {
        title: "Kejohanan Olahraga Daerah 2025",
        desc: "Tempat ke-2 keseluruhan dalam Kejohanan Olahraga Daerah Kuala Langat dengan 12 pingat.",
      },
      {
        title: "Kem Latihan Pengakap Kebangsaan",
        desc: "5 orang murid terpilih menyertai Kem Latihan Pengakap Peringkat Kebangsaan di Kem Batu Tiga.",
      },
      {
        title: "Pertandingan Debat Zon Selatan",
        desc: "Pasukan debat Bahasa Melayu sekolah mara ke peringkat akhir zon selatan buat kali pertama.",
      },
    ],
    jkTables: [
      {
        title: "JM30 — Jawatankuasa Pengurusan Kokurikulum",
        members: [
          { name: "Puan Masroha binti Abu", jawatan: "Pengerusi" },
          { name: "Encik Hairul Hisham bin Awang", jawatan: "Penolong Kokurikulum" },
          { name: "Puan Suzana binti Md Salleh", jawatan: "Setiausaha" },
          { name: "Encik Shahril bin Mansor", jawatan: "Ketua Unit Sukan" },
          { name: "Puan Haryati binti Rosli", jawatan: "Ketua Unit Persatuan" },
          { name: "Encik Zulkifli bin Harun", jawatan: "Ketua Unit Badan Beruniform" },
        ],
      },
      {
        title: "JM31 — Jawatankuasa Pembangunan Sukan Sekolah",
        members: [
          { name: "Encik Shahril bin Mansor", jawatan: "Pengerusi" },
          { name: "Encik Hairul Hisham bin Awang", jawatan: "Timbalan Pengerusi" },
          { name: "Puan Suzana binti Md Salleh", jawatan: "Setiausaha" },
          { name: "Encik Zulkifli bin Harun", jawatan: "AJK" },
          { name: "Puan Haryati binti Rosli", jawatan: "AJK" },
        ],
      },
      {
        title: "JM32 — Jawatankuasa Sukan Tahunan Sekolah",
        members: [
          { name: "Encik Hairul Hisham bin Awang", jawatan: "Pengerusi" },
          { name: "Encik Shahril bin Mansor", jawatan: "Timbalan Pengerusi" },
          { name: "Puan Suzana binti Md Salleh", jawatan: "Setiausaha" },
          { name: "Puan Haryati binti Rosli", jawatan: "Bendahari" },
          { name: "Encik Zulkifli bin Harun", jawatan: "AJK Keselamatan" },
          { name: "Puan Noriza binti Manap", jawatan: "AJK Jemputan" },
        ],
      },
      {
        title: "JM33 — Jawatankuasa Koperasi Sekolah",
        members: [
          { name: "Puan Masroha binti Abu", jawatan: "Pengerusi" },
          { name: "Puan Haryati binti Rosli", jawatan: "Pengurus Koperasi" },
          { name: "Puan Suzana binti Md Salleh", jawatan: "Setiausaha" },
          { name: "Encik Hairul Hisham bin Awang", jawatan: "AJK" },
        ],
      },
      {
        title: "JK Pasukan Badan Beruniform (PBB)",
        members: [
          { name: "Encik Zulkifli bin Harun", jawatan: "Pengerusi" },
          { name: "Puan Norzarina binti Abdul Ghani", jawatan: "Pengawal PBSM" },
          { name: "Encik Farouk bin Nordin", jawatan: "Pengawal Pengakap" },
          { name: "Puan Hasimah binti Yahaya", jawatan: "Pengawal Kadet Remaja Sekolah" },
        ],
      },
      {
        title: "JK Kelab dan Persatuan Akademik",
        members: [
          { name: "Puan Haryati binti Rosli", jawatan: "Pengerusi" },
          { name: "Puan Noriza binti Manap", jawatan: "Timbalan Pengerusi" },
          { name: "Puan Suzana binti Md Salleh", jawatan: "Setiausaha" },
          { name: "Encik Shahril bin Mansor", jawatan: "AJK" },
          { name: "Encik Hairul Hisham bin Awang", jawatan: "AJK" },
        ],
      },
      {
        title: "JK Pengurusan Latihan Pasukan Permainan Sekolah",
        members: [
          { name: "Encik Shahril bin Mansor", jawatan: "Pengerusi" },
          { name: "Encik Zulkifli bin Harun", jawatan: "Jurulatih Bola Sepak" },
          { name: "Puan Norzarina binti Abdul Ghani", jawatan: "Jurulatih Bola Jaring" },
          { name: "Encik Farouk bin Nordin", jawatan: "Jurulatih Badminton" },
          { name: "Puan Hasimah binti Yahaya", jawatan: "Jurulatih Olahraga" },
        ],
      },
    ],
    dokumen: [
      { label: "Takwim Kokurikulum dan Sukan Tahun 2026", desc: "Jadual lengkap aktiviti kokurikulum dan sukan sepanjang tahun" },
      { label: "Jadual Perhimpunan Badan Beruniform (PBB) 2026", desc: "Jadual perhimpunan mingguan dan bulanan semua pasukan PBB" },
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
    jkTables: [
      {
        title: "JM11 — Jawatankuasa Pengurusan Tingkatan 6",
        members: [
          { name: "Dr. Awaludin bin Ahmad", jawatan: "Pengerusi (GPK T6)" },
          { name: "Puan Norzalina binti Baharudin", jawatan: "Setiausaha" },
          { name: "Encik Mohd Fauzi bin Mahayudin", jawatan: "Ketua Panitia Bahasa Melayu" },
          { name: "Puan Rohaidah binti Kamaruzzaman", jawatan: "Ketua Panitia Matematik" },
          { name: "Encik Rashdan bin Harun", jawatan: "Ketua Panitia Sains" },
          { name: "Puan Zariza binti Zainudin", jawatan: "AJK" },
        ],
      },
    ],
  },
  {
    slug: "ubk",
    navLabel: "UBK",
    title: "Unit Bimbingan & Kaunseling (UBK)",
    headName: "Puan Nurulhuda binti Hassan",
    headPosition: "Guru Bimbingan & Kaunseling Sepenuh Masa",
    kpis: [
      { label: "Sesi Kaunseling Individu", value: 120 },
      { label: "Sesi Kaunseling Kelompok", value: 45 },
      { label: "Program Pembangunan Sahsiah", value: 12 },
    ],
    jkTables: [
      {
        title: "Jawatankuasa Unit Bimbingan & Kaunseling",
        members: [
          { name: "Puan Hanizam binti Kassim", jawatan: "Pengerusi (Pengetua)" },
          { name: "Puan Norliza binti Jais", jawatan: "Timbalan Pengerusi (GPK HEM)" },
          { name: "Puan Nurulhuda binti Hassan", jawatan: "Setiausaha (Guru Bimbingan & Kaunseling)" },
          { name: "Puan Asma binti Che Mat", jawatan: "Ahli" },
          { name: "Semua Guru Kanan Mata Pelajaran", jawatan: "Ahli" },
        ],
      },
    ],
    dokumen: [
      { label: "Modul Minda Sihat", desc: "Saringan dan panduan kesihatan mental" },
      { label: "Brosur Laluan Kerjaya", desc: "Hala tuju pendidikan selepas SPM" },
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

