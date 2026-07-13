require("dotenv").config();
const mysql = require("mysql2/promise");

async function main() {
  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await conn.query(`
    CREATE TABLE IF NOT EXISTS psikometrik_results (
      id INT AUTO_INCREMENT NOT NULL,
      no_pengenalan VARCHAR(20) NOT NULL,
      nama_murid VARCHAR(200) NOT NULL,
      kod_sekolah VARCHAR(20),
      nama_sekolah VARCHAR(200),
      nama_kelas VARCHAR(50),
      tarikh VARCHAR(30),
      scores_json TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY psikometrik_results_no_pengenalan_unique (no_pengenalan),
      KEY psikometrik_no_pengenalan_idx (no_pengenalan)
    );
  `);
  console.log("psikometrik_results table ready");

  // Seed sample matching PDF example
  const sample = {
    no_pengenalan: "090310101950",
    nama_murid: "AIN BATRISYA BINTI ABU BAKAR",
    kod_sekolah: "BEA1069",
    nama_sekolah: "SEKOLAH MENENGAH KEBANGSAAN TELOK PANGLIMA GARANG",
    nama_kelas: "4 GKT",
    tarikh: "04 Sep 2025",
    scores_json: JSON.stringify({
      AUT: 70, KTF: 70, AGF: 60, EKT: 99, PCP: 80, KPG: 99,
      ITL: 90, KPN: 70, STR: 70, RSL: 80, MLG: 90, ATL: 99,
      KD: 60, WSN: 80, KTN: 30,
    }),
  };

  await conn.query(
    `INSERT INTO psikometrik_results (no_pengenalan, nama_murid, kod_sekolah, nama_sekolah, nama_kelas, tarikh, scores_json)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE nama_murid=VALUES(nama_murid), kod_sekolah=VALUES(kod_sekolah), nama_sekolah=VALUES(nama_sekolah), nama_kelas=VALUES(nama_kelas), tarikh=VALUES(tarikh), scores_json=VALUES(scores_json)`,
    [sample.no_pengenalan, sample.nama_murid, sample.kod_sekolah, sample.nama_sekolah, sample.nama_kelas, sample.tarikh, sample.scores_json],
  );
  console.log("Seeded sample row for", sample.no_pengenalan);

  await conn.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
