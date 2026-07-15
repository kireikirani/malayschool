import type { Step } from "react-joyride";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardSteps: Step[] = [
  {
    target: "[data-tour='dashboard-stats']",
    title: "Ringkasan Dashboard",
    content: "Papan pemuka menunjukkan bilangan kandungan terkini — berita, guru, pelajar asrama, dan lain-lain.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='dashboard-quick-links']",
    title: "Akses Pantas",
    content: "Klik mana-mana kad untuk menuju terus ke bahagian berkenaan dalam panel admin.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Unit Dokumen ─────────────────────────────────────────────────────────────
export const unitDokumenSteps: Step[] = [
  {
    target: "[data-tour='unit-tabs']",
    title: "Pilih Unit",
    content: "Klik tab unit yang ingin anda urus. Setiap unit mempunyai carta organisasi dan senarai dokumen tersendiri.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='carta-org']",
    title: "Carta Organisasi",
    content: "Muat naik gambar carta organisasi unit di sini. Gambar ini akan dipaparkan di halaman awam unit berkenaan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='dokumen-slot']",
    title: "Slot Dokumen",
    content: "Setiap baris ialah satu slot dokumen yang telah ditetapkan. Muat naik fail PDF atau gunakan pautan Google Drive / URL luar.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='url-toggle']",
    title: "Guna Pautan URL / Google Drive",
    content: "Klik butang ini untuk memasukkan pautan Google Drive, Canva, atau mana-mana URL dokumen awam. Pratonton akan dipaparkan secara automatik.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='visibility-switch']",
    title: "Tunjuk / Sembunyi Dokumen",
    content: "Toggle ini mengawal sama ada dokumen dipaparkan kepada pengunjung laman web. Matikan untuk menyembunyikan sementara tanpa memadamnya.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: "[data-tour='add-custom']",
    title: "Tambah Dokumen Lain",
    content: "Selain slot yang ditetapkan, anda boleh menambah dokumen bebas — laporan, minit mesyuarat — dengan label dan pautan sendiri.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Public Content ───────────────────────────────────────────────────────────
export const contentSteps: Step[] = [
  {
    target: "[data-tour='content-table']",
    title: "Senarai Seksyen Kandungan",
    content: "Setiap baris ialah satu blok kandungan di halaman awam. Anda boleh menambah, mengedit, atau memadam seksyen.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='add-section']",
    title: "Tambah Seksyen Baharu",
    content: "Klik di sini untuk menambah seksyen baharu. Terdapat pelbagai jenis: blok teks, statistik, jadual, galeri, pautan pantas, dan lain-lain.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='section-type-col']",
    title: "Jenis Seksyen",
    content: "Jenis seksyen menentukan rupa paparan di laman awam. Pilih yang sesuai semasa menambah seksyen baharu.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: "[data-tour='section-active-col']",
    title: "Status Aktif",
    content: "Tanda ✓ bermaksud seksyen dipaparkan kepada pengunjung. Anda boleh nyahaktifkan seksyen tanpa memadamnya.",
    placement: "left",
    skipBeacon: true,
  },
];

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsSteps: Step[] = [
  {
    target: "[data-tour='settings-tabs']",
    title: "Tab Tetapan",
    content: "Tetapan dibahagikan kepada 6 tab. Klik setiap tab untuk mengedit bahagian berkenaan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='settings-sekolah']",
    title: "Maklumat Sekolah",
    content: "Isikan nama sekolah, tagline, visi, dan misi. Maklumat ini dipaparkan di seluruh laman web.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='settings-statistik']",
    title: "Tab Statistik",
    content: "Kemas kini jumlah pelajar, guru, kelas, dan tarikh SPM yang akan dipaparkan di laman utama.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='settings-tema']",
    title: "Tema Warna",
    content: "Tukar warna utama laman web di sini. Pilih preset warna atau masukkan kod warna tersendiri.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='settings-save']",
    title: "Simpan Tetapan",
    content: "Setelah membuat perubahan di mana-mana tab, klik 'Simpan' untuk menerapkan semua perubahan sekaligus.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Unit JK (Jawatankuasa) ───────────────────────────────────────────────────
export const unitJkSteps: Step[] = [
  {
    target: "[data-tour='jk-unit-filter']",
    title: "Tapis Mengikut Unit",
    content: "Pilih unit yang ingin anda urus. Setiap unit boleh mempunyai beberapa jawatankuasa (JK) yang berbeza.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='jk-table']",
    title: "Senarai Ahli JK",
    content: "Semua ahli jawatankuasa untuk unit yang dipilih disenaraikan di sini, termasuk nama, jawatan, dan nama JK.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='jk-add']",
    title: "Tambah Ahli JK",
    content: "Klik untuk menambah ahli baharu. Dalam borang: Kod JK (contoh: 'jk-pengurusan') mengumpulkan ahli dalam kumpulan yang sama, manakala Nama JK (contoh: 'JK Pengurusan') ialah tajuk yang dipaparkan di laman awam.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Asrama Fasiliti ──────────────────────────────────────────────────────────
export const asramaFasilitiSteps: Step[] = [
  {
    target: "[data-tour='fasiliti-table']",
    title: "Senarai Fasiliti",
    content: "Fasiliti asrama yang dipaparkan di halaman Asrama. Anda boleh tambah, edit, atau padam fasiliti.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='fasiliti-add']",
    title: "Tambah Fasiliti",
    content: "Klik untuk menambah fasiliti baharu. Pilih ikon yang sesuai dan masukkan nama fasiliti.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='fasiliti-icon']",
    title: "Pilihan Ikon",
    content: "Setiap fasiliti boleh mempunyai ikon yang berbeza. Pilih dari senarai ikon yang disediakan — ikon ini akan dipaparkan di laman awam.",
    placement: "right",
    skipBeacon: true,
  },
];

// ─── Media ────────────────────────────────────────────────────────────────────
export const mediaSteps: Step[] = [
  {
    target: "[data-tour='media-upload']",
    title: "Muat Naik Gambar",
    content: "Klik butang ini untuk memuat naik gambar baharu ke perpustakaan media. Gambar akan disimpan di storan awan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='media-search']",
    title: "Cari Media",
    content: "Taip nama fail dan tekan Enter untuk mencari gambar tertentu dalam perpustakaan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='media-grid']",
    title: "Galeri Media",
    content: "Semua gambar yang telah dimuat naik dipaparkan di sini. Klik butang 'Salin URL' pada sebarang gambar untuk mendapatkan pautan yang boleh digunakan dalam kandungan.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Documents (Sekolah) ──────────────────────────────────────────────────────
export const documentsSteps: Step[] = [
  {
    target: "[data-tour='docs-category']",
    title: "Tapis Mengikut Kategori",
    content: "Tapis dokumen mengikut jenis: Semua, Spreadsheet, PDF, atau Dokumen Word.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='docs-upload']",
    title: "Muat Naik Dokumen",
    content: "Klik untuk memuat naik dokumen sekolah — fail PDF, Excel, atau Word. Dokumen ini boleh dikongsi kepada pengunjung laman.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='docs-grid']",
    title: "Senarai Dokumen",
    content: "Semua dokumen yang dimuat naik dipaparkan di sini. Setiap kad mempunyai pratonton, butang salin URL, dan padam.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Units (Section) ──────────────────────────────────────────────────────────
export const unitsSteps: Step[] = [
  {
    target: "[data-tour='units-filter']",
    title: "Tapis Mengikut Unit",
    content: "Pilih unit tertentu untuk melihat seksyen kandungannya sahaja, atau pilih 'Semua' untuk lihat semua seksyen.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='units-table']",
    title: "Seksyen Unit",
    content: "Setiap baris ialah satu blok kandungan di halaman unit — carta org, statistik KPI, jadual JK, dan lain-lain.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='units-add']",
    title: "Tambah Seksyen Unit",
    content: "Tambah seksyen kandungan baharu untuk sesebuah unit. Pilih jenis seksyen yang sesuai. Untuk menyusun semula urutan, gunakan menu tiga titik dan pilih 'Naikkan' atau 'Turunkan'.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Asrama Pelajar ───────────────────────────────────────────────────────────
export const asramaPelajarSteps: Step[] = [
  {
    target: "[data-tour='pelajar-table']",
    title: "Senarai Pelajar Asrama",
    content: "Semua pelajar yang mendaftar asrama tersenarai di sini. Klik Edit atau Padam untuk mengurus rekod pelajar.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='pelajar-add']",
    title: "Daftar Pelajar Baharu",
    content: "Klik untuk mendaftarkan pelajar asrama baharu. Isi maklumat nama, tingkatan, blok, dan gambar pelajar.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── News (Berita) ────────────────────────────────────────────────────────────
export const newsSteps: Step[] = [
  {
    target: "[data-tour='news-table']",
    title: "Senarai Berita",
    content: "Semua artikel berita tersenarai di sini. Klik menu tiga titik untuk edit, pratonton, atau padam berita.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='news-add']",
    title: "Tambah Berita",
    content: "Klik untuk menulis artikel berita baharu. Editor menyokong teks kaya, gambar, dan pautan.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Pengumuman ───────────────────────────────────────────────────────────────
export const pengumumanSteps: Step[] = [
  {
    target: "[data-tour='pengumuman-table']",
    title: "Senarai Pengumuman",
    content: "Semua pengumuman yang aktif tersenarai di sini. Pengumuman terbaru dipaparkan di bar tatal laman utama.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='pengumuman-add']",
    title: "Tambah Pengumuman",
    content: "Klik untuk membuat pengumuman baharu. Anda boleh tetapkan tarikh tamat untuk menyembunyikannya secara automatik.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Gallery (Album List) ─────────────────────────────────────────────────────
export const gallerySteps: Step[] = [
  {
    target: "[data-tour='gallery-table']",
    title: "Senarai Album",
    content: "Semua album galeri foto tersenarai di sini. Klik menu tiga titik pada mana-mana album untuk kelola foto, edit maklumat, atau padam.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='gallery-add']",
    title: "Buat Album Baharu",
    content: "Klik untuk mencipta album foto baharu. Isi Tajuk/Program, Tarikh acara, dan Link Google Drive (jika ada). Album ini akan muncul di halaman Galeri laman web.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Gallery Album Form (New / Edit) ─────────────────────────────────────────
export const galleryAlbumFormSteps: Step[] = [
  {
    target: "[data-tour='gallery-form-title']",
    title: "Tajuk / Program",
    content: "Nama program atau acara (contoh: Hari Sukan 2025, Majlis Graduasi). Tajuk ini dipaparkan sebagai kepala album di laman awam.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='gallery-form-schedule']",
    title: "Tarikh & Link Google Drive",
    content: "Tarikh acara dipaparkan di bawah tajuk album. Link Google Drive membolehkan pengunjung melihat gambar resolusi penuh — tampal URL folder atau album Drive di sini.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='gallery-form-cover']",
    title: "Sampul Album & Ciri Crop",
    content: "Pilih gambar sampul yang mewakili album ini. Gunakan 'Pilih & Crop' untuk memotong gambar supaya bahagian penting (seperti muka atau tajuk) terpapar dengan tepat. Tetapkan nisbah crop yang sesuai — contohnya 3:4 untuk gambar potret.",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: "[data-tour='gallery-form-submit']",
    title: "Simpan Album",
    content: "Klik Simpan untuk menerbitkan album. Selepas itu, buka 'Kelola Foto' dari senarai album untuk muat naik gambar-gambar ke dalam album ini.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Gallery Album Items (Photo Management) ───────────────────────────────────
export const galleryAlbumItemsSteps: Step[] = [
  {
    target: "[data-tour='gallery-upload']",
    title: "Muat Naik Foto",
    content: "Seret & lepas foto atau klik untuk memilih. Boleh muat naik beberapa foto serentak. Foto dimuat naik terus ke storan awan dan ditambah ke album ini.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='gallery-items-grid']",
    title: "Foto dalam Album",
    content: "Semua foto tersenarai di sini. Edit keterangan (caption) pada setiap foto — keterangan ini dipaparkan dalam lightbox apabila pengunjung klik gambar.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='gallery-item-reorder']",
    title: "Susun Semula Urutan",
    content: "Gunakan butang ↑ ↓ untuk mengubah urutan paparan foto dalam album. Foto pertama akan dipaparkan pertama dalam grid galeri laman awam.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── UBK Dashboard ───────────────────────────────────────────────────────────
export const ubkDashboardSteps: Step[] = [
  {
    target: "[data-tour='ubk-intro']",
    title: "Dashboard UBK",
    content: "Di sini anda urus semua pautan Google Sheets ITP. Sistem akan ambil data dari sheet tersebut supaya pelajar boleh semak keputusan di halaman awam /ubk.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ubk-add-btn']",
    title: "Langkah 1 — Tambah Pautan Sheet",
    content: "Klik butang ini untuk menambah pautan Google Sheets yang mengandungi data ITP pelajar. Satu tingkatan boleh mempunyai lebih daripada satu pautan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ubk-form']",
    title: "Isi Maklumat Pautan",
    content: "Pilih tingkatan, isi label (contoh: 'ITP Sesi 2025'), dan tampal URL Google Sheets. Pastikan sheet disetkan kepada 'Anyone with the link can view' supaya sistem boleh membacanya.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ubk-groups']",
    title: "Pautan Mengikut Tingkatan",
    content: "Semua pautan tersusun mengikut tingkatan. Satu tingkatan boleh mempunyai beberapa sesi atau kumpulan yang berbeza.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ubk-import-btn']",
    title: "Langkah 2 — Import Data",
    content: "Klik 'Import Sekarang' untuk sistem mengambil data dari Google Sheets dan menyimpannya ke pangkalan data. Rekod sedia ada dikemaskini berdasarkan No. Pengenalan — tiada duplikat.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ubk-last-import']",
    title: "Status Import Terakhir",
    content: "Selepas import, tarikh dan bilangan rekod yang diproses dipaparkan di sini. Import boleh dijalankan semula bila-bila masa untuk mengemas kini data terbaru.",
    placement: "left",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ubk-records-link']",
    title: "Langkah 3 — Semak Rekod",
    content: "Klik 'Lihat Semua Rekod' untuk menyemak data yang telah diimport. Anda boleh cari, edit, atau padam rekod individu di sana.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Advertisements (Iklan) ───────────────────────────────────────────────────
export const advertisementsSteps: Step[] = [
  {
    target: "[data-tour='ads-table']",
    title: "Senarai Iklan",
    content: "Iklan yang aktif akan dipaparkan di panel sisi laman web. Anda boleh mengurus urutan, tajuk, dan gambar iklan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ads-add']",
    title: "Tambah Iklan",
    content: "Klik untuk menambah iklan baharu. Masukkan tajuk, pautan destinasi, dan muat naik gambar banner.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Teachers (Guru) ──────────────────────────────────────────────────────────
export const teachersSteps: Step[] = [
  {
    target: "[data-tour='teachers-table']",
    title: "Senarai Guru",
    content: "Semua guru yang berdaftar tersenarai di sini. Data ini dipaparkan dalam halaman profil guru laman web.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='teachers-add']",
    title: "Tambah Guru",
    content: "Klik untuk mendaftarkan guru baharu. Isikan nama, jawatan, opsyen unit, dan muat naik foto.",
    placement: "bottom",
    skipBeacon: true,
  },
];

// ─── Form: Berita (New / Edit) ────────────────────────────────────────────────
export const newsFormSteps: Step[] = [
  {
    target: "[data-tour='news-form-title']",
    title: "Tajuk & Slug",
    content: "Isi tajuk berita. Slug (URL unik) akan dijana automatik dari tajuk jika dikosongkan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='news-form-content']",
    title: "Editor Kandungan",
    content: "Tulis isi berita menggunakan editor teks kaya. Toolbar menyokong format tebal, senarai, jadual, pautan, dan gambar.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='news-form-thumbnail']",
    title: "Gambar Thumbnail",
    content: "Muat naik gambar wakil berita. Gambar ini dipaparkan dalam kad berita di senarai. Saiz disyorkan: 800×450 piksel.",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: "[data-tour='news-form-status']",
    title: "Status & Tarikh Terbit",
    content: "'Draft' — simpan tanpa siarkan. 'Diterbitkan' — terus papar kepada pembaca. Tarikh terbit boleh ditentukan atau dibiarkan kosong.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='news-form-meta']",
    title: "Maklumat SEO",
    content: "Meta Title dan Meta Description digunakan oleh Google. Kosongkan untuk gunakan tajuk berita secara automatik. OG Image ialah gambar yang muncul apabila dikongsi di media sosial.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Form: Guru (New / Edit) ──────────────────────────────────────────────────
export const teacherFormSteps: Step[] = [
  {
    target: "[data-tour='teacher-form-photo']",
    title: "Foto Guru",
    content: "Klik kawasan ini untuk memuat naik foto profil guru dari perpustakaan media atau komputer anda.",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: "[data-tour='teacher-form-sort']",
    title: "Urutan Paparan",
    content: "Nombor lebih kecil dipapar dahulu. Guna 0, 1, 2… untuk susun guru mengikut hierarki atau jawatan.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='teacher-form-status']",
    title: "Status Guru",
    content: "Hanya guru 'Aktif' yang dipaparkan kepada pengunjung laman web. Tetapkan 'Nonaktif' untuk sembunyikan sementara.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Form: Pengumuman (New / Edit) ────────────────────────────────────────────
export const pengumumanFormSteps: Step[] = [
  {
    target: "[data-tour='pengumuman-form-poster']",
    title: "Gambar Poster",
    content: "Muat naik poster atau gambar pengumuman. Gambar ini dipaparkan dalam slider tatal di laman utama.",
    placement: "right",
    skipBeacon: true,
  },
  {
    target: "[data-tour='pengumuman-form-tamat']",
    title: "Tarikh & Urutan",
    content: "Tetapkan tarikh pengumuman berhenti dipaparkan secara automatik. Nombor urutan menentukan susunan dalam slider.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='pengumuman-form-aktif']",
    title: "Status Aktif",
    content: "Toggle ini mengawal sama ada pengumuman dipaparkan di laman utama sekarang. Matikan untuk sembunyikan tanpa padam.",
    placement: "top",
    skipBeacon: true,
  },
];

// ─── Form: Iklan (New / Edit) ─────────────────────────────────────────────────
export const advertisementFormSteps: Step[] = [
  {
    target: "[data-tour='ad-form-type']",
    title: "Jenis & Penempatan",
    content: "Pilih jenis kandungan (AdSense, HTML, gambar banner, atau pautan) dan lokasi iklan di laman web.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ad-form-content']",
    title: "Kandungan Iklan",
    content: "Isi kandungan mengikut jenis yang dipilih — tampal kod AdSense, HTML, atau masukkan URL gambar/pautan.",
    placement: "top",
    skipBeacon: true,
  },
  {
    target: "[data-tour='ad-form-preview']",
    title: "Pratinjau Status",
    content: "Semak ringkasan penempatan, status, dan kandungan di sini sebelum simpan untuk pastikan tetapan adalah betul.",
    placement: "top",
    skipBeacon: true,
  },
];
