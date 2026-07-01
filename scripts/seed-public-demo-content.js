require("dotenv").config();
const mysql = require("mysql2/promise");

const DUMMY_PDF_URL = "/documents/dummy-school-document.pdf";
const DUMMY_POSTER = "/gallery/sekolah/bangunan-sekolah.jpg";
const DUMMY_ASRAMA_POSTER = "/gallery/pentadbiran/pengetua-hanizam.png";
const DUMMY_CHART = "/brand/logo.png";

const unitSeeds = [
  {
    slug: "pentadbiran",
    title: "Unit Pengurusan & Pentadbiran",
    docLabel: "Log Harian Pengurusan",
  },
  {
    slug: "kurikulum",
    title: "Unit Kurikulum",
    docLabel: "Jadual Peperiksaan Dalaman 2026",
  },
  {
    slug: "hem",
    title: "Unit Hal Ehwal Murid (HEM)",
    docLabel: "Carta Organisasi HEM",
  },
  {
    slug: "kokurikulum",
    title: "Unit Kokurikulum",
    docLabel: "Takwim Kokurikulum dan Sukan Tahun 2026",
  },
  {
    slug: "tingkatan-6",
    title: "Unit Tingkatan 6",
    docLabel: null,
  },
];

async function scalar(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  const first = rows[0];
  return Number(first[Object.keys(first)[0]] || 0);
}

async function row(conn, sql, params = []) {
  const [rows] = await conn.query(sql, params);
  return rows[0] || null;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const conn = await mysql.createConnection({
    uri: databaseUrl,
    ssl: databaseUrl.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  });

  try {
    if ((await scalar(conn, "SELECT COUNT(*) AS value FROM pengumuman")) === 0) {
      await conn.query(
        `INSERT INTO pengumuman
          (tajuk, deskripsi, image_url, link_url, aktif, sort_order, created_at, updated_at)
         VALUES
          (?, ?, ?, ?, true, 0, NOW(), NOW()),
          (?, ?, ?, ?, true, 1, NOW(), NOW())`,
        [
          "Poster Info Terkini Sekolah",
          "Hebahan awam untuk menguji paparan poster pada laman utama dan halaman asrama.",
          DUMMY_POSTER,
          "/news",
          "Program Asrama Mingguan",
          "Poster contoh untuk aktiviti dan pengumuman berkaitan penginapan murid.",
          DUMMY_ASRAMA_POSTER,
          "/asrama",
        ],
      );
    }

    if ((await scalar(conn, "SELECT COUNT(*) AS value FROM news WHERE status = 'published'")) === 0) {
      await conn.query(
        `INSERT INTO news
          (id, title, slug, content, thumbnail, status, publish_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'published', NOW(), NOW(), NOW())`,
        [
          crypto.randomUUID(),
          "Hebahan Demo Kandungan Awam",
          `hebahan-demo-${Date.now()}`,
          "<p>Artikel demo ini memastikan halaman utama, berita, dan pautan pengumuman mengambil kandungan terus daripada pangkalan data.</p>",
          DUMMY_POSTER,
        ],
      );
    }

    if ((await scalar(conn, "SELECT COUNT(*) AS value FROM media WHERE folder = 'documents'")) === 0) {
      await conn.query(
        `INSERT INTO media
          (id, file_name, file_path, file_key, file_type, file_size, folder, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, 'documents', NOW())`,
        [
          crypto.randomUUID(),
          "Borang-Sekolah-Dummy.pdf",
          DUMMY_PDF_URL,
          "seed:dummy-school-document",
          "application/pdf",
          640,
        ],
      );
    }

    if ((await scalar(conn, "SELECT COUNT(*) AS value FROM asrama_pelajar WHERE status = 'active'")) === 0) {
      await conn.query(
        `INSERT INTO asrama_pelajar
          (jantina, nama, tingkatan, dorm, nama_waris, no_waris, status, created_at, updated_at)
         VALUES
          ('lelaki', ?, ?, ?, ?, ?, 'active', NOW(), NOW()),
          ('lelaki', ?, ?, ?, ?, ?, 'active', NOW(), NOW()),
          ('perempuan', ?, ?, ?, ?, ?, 'active', NOW(), NOW()),
          ('perempuan', ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
        [
          "Muhammad Aiman bin Razak", "4 Bestari", "Aspura A-01", "Razak bin Salleh", "012-3456789",
          "Hakimi bin Zulkifli", "5 Inovatif", "Aspura B-03", "Zulkifli bin Hassan", "012-5551212",
          "Nurul Izzah binti Halim", "4 Dedikasi", "Aspuri C-02", "Halimah binti Osman", "013-4455667",
          "Alya Sofea binti Ahmad", "5 Bestari", "Aspuri D-04", "Ahmad bin Yusof", "019-7788990",
        ],
      );
    }

    for (const unit of unitSeeds) {
      const existingChart = await row(
        conn,
        "SELECT id FROM unit_documents WHERE unit_slug = ? AND type = 'carta-org' LIMIT 1",
        [unit.slug],
      );

      if (!existingChart) {
        await conn.query(
          `INSERT INTO unit_documents
            (unit_slug, type, label, file_url, file_type, sort_order, created_at, updated_at)
           VALUES (?, 'carta-org', ?, ?, 'image', 0, NOW(), NOW())`,
          [unit.slug, `Carta Organisasi ${unit.title}`, DUMMY_CHART],
        );
      }

      if (unit.docLabel) {
        const existingDoc = await row(
          conn,
          "SELECT id FROM unit_documents WHERE unit_slug = ? AND type = 'dokumen' AND label = ? LIMIT 1",
          [unit.slug, unit.docLabel],
        );

        if (!existingDoc) {
          await conn.query(
            `INSERT INTO unit_documents
              (unit_slug, type, label, file_url, file_type, sort_order, created_at, updated_at)
             VALUES (?, 'dokumen', ?, ?, 'pdf', 0, NOW(), NOW())`,
            [unit.slug, unit.docLabel, DUMMY_PDF_URL],
          );
        }
      }
    }

    console.log("Seeded public demo content.");
  } finally {
    await conn.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
