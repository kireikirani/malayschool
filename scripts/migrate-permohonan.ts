import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

// Apply migration 0008 (asrama_permohonan) idempotently.
// Mirrors scripts/migrate-new-tables.ts pattern: skip duplicate errors.
const STATEMENTS = [
  // 1. Create table
  `CREATE TABLE IF NOT EXISTS \`asrama_permohonan\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`pelajar_id\` int NOT NULL,
    \`nama_pelajar\` varchar(200) NOT NULL,
    \`tingkatan\` varchar(10) NOT NULL,
    \`dorm\` varchar(100) NOT NULL,
    \`jenis\` enum('pulang_bermalam','outing','mc_sakit') NOT NULL,
    \`tarikh_keluar\` date NOT NULL,
    \`tarikh_pulang\` date,
    \`sebab\` text NOT NULL,
    \`status\` enum('menunggu','diluluskan','ditolak','mc') NOT NULL DEFAULT 'menunggu',
    \`no_waris_pengirim\` varchar(20) NOT NULL,
    \`diluluskan_oleh\` varchar(200),
    \`approver_user_id\` varchar(36),
    \`tarikh_kelulusan\` timestamp,
    \`catatan\` text,
    \`pengambil\` varchar(200),
    \`no_pendaftaran\` varchar(20),
    \`guard_user_id\` varchar(36),
    \`guard_nama\` varchar(200),
    \`tarikh_diambil\` timestamp,
    \`created_at\` timestamp NOT NULL DEFAULT NOW(),
    \`updated_at\` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT \`asrama_permohonan_id\` PRIMARY KEY(\`id\`)
  );`,

  // 2. Foreign keys
  `ALTER TABLE \`asrama_permohonan\` ADD CONSTRAINT \`asrama_permohonan_pelajar_id_asrama_pelajar_id_fk\` FOREIGN KEY (\`pelajar_id\`) REFERENCES \`asrama_pelajar\`(\`id\`) ON DELETE cascade;`,
  `ALTER TABLE \`asrama_permohonan\` ADD CONSTRAINT \`asrama_permohonan_approver_user_id_user_id_fk\` FOREIGN KEY (\`approver_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL;`,
  `ALTER TABLE \`asrama_permohonan\` ADD CONSTRAINT \`asrama_permohonan_guard_user_id_user_id_fk\` FOREIGN KEY (\`guard_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL;`,

  // 3. Indexes
  `CREATE INDEX \`asrama_permohonan_status_idx\` ON \`asrama_permohonan\` (\`status\`);`,
  `CREATE INDEX \`asrama_permohonan_jenis_idx\` ON \`asrama_permohonan\` (\`jenis\`);`,
  `CREATE INDEX \`asrama_permohonan_pelajar_id_idx\` ON \`asrama_permohonan\` (\`pelajar_id\`);`,
  `CREATE INDEX \`asrama_permohonan_tarikh_keluar_idx\` ON \`asrama_permohonan\` (\`tarikh_keluar\`);`,
];

async function main() {
  console.log(`Applying ${STATEMENTS.length} DDL statements for asrama_permohonan...`);
  for (let i = 0; i < STATEMENTS.length; i++) {
    try {
      await db.execute(sql.raw(STATEMENTS[i]));
      console.log(`[OK] ${i + 1}/${STATEMENTS.length}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isDuplicate =
        msg.includes("Duplicate column") ||
        msg.includes("Duplicate key name") ||
        msg.includes("already exists") ||
        msg.includes("Multiple primary") ||
        msg.includes("Duplicate foreign key") ||
        msg.includes("errno: 1061") ||
        msg.includes("errno: 1060");
      if (isDuplicate) {
        console.log(`[SKIP - exists] ${i + 1}/${STATEMENTS.length}`);
      } else {
        console.warn(`[WARN] ${i + 1}/${STATEMENTS.length}:`, msg);
      }
    }
  }
  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
