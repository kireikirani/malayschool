import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

const STATEMENTS = [
  // 1. Create tables
  `CREATE TABLE IF NOT EXISTS \`unit_jk_documents\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`unit_slug\` varchar(50) NOT NULL,
    \`jk_code\` varchar(100) NOT NULL,
    \`label\` varchar(200) NOT NULL,
    \`file_url\` text NOT NULL,
    \`file_type\` enum('pdf','image','doc','link') NOT NULL DEFAULT 'pdf',
    \`tahun\` varchar(10),
    \`is_visible\` boolean NOT NULL DEFAULT true,
    \`sort_order\` int NOT NULL DEFAULT 0,
    \`created_at\` timestamp NOT NULL DEFAULT NOW(),
    \`updated_at\` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT \`unit_jk_documents_id\` PRIMARY KEY(\`id\`)
  );`,
  `CREATE TABLE IF NOT EXISTS \`asrama_fasiliti\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`icon_name\` varchar(100) NOT NULL,
    \`label\` varchar(200) NOT NULL,
    \`sort_order\` int NOT NULL DEFAULT 0,
    \`created_at\` timestamp NOT NULL DEFAULT NOW(),
    \`updated_at\` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT \`asrama_fasiliti_id\` PRIMARY KEY(\`id\`)
  );`,

  // 2. Alter user table
  `ALTER TABLE \`user\` MODIFY COLUMN \`role\` enum('admin','teacher','visitor') NOT NULL DEFAULT 'visitor';`,
  `ALTER TABLE \`user\` ADD COLUMN \`is_approved\` boolean DEFAULT false NOT NULL;`,
  `ALTER TABLE \`user\` ADD COLUMN \`rejection_reason\` text;`,
  `ALTER TABLE \`user\` ADD COLUMN \`teacher_phone\` varchar(50);`,
  `ALTER TABLE \`user\` ADD COLUMN \`teacher_subject\` varchar(255);`,
  `ALTER TABLE \`user\` ADD COLUMN \`teacher_notes\` text;`,

  // 3. Alter teachers table
  `ALTER TABLE \`teachers\` ADD COLUMN \`user_id\` varchar(36);`,
  `ALTER TABLE \`teachers\` ADD COLUMN \`phone\` varchar(50);`,
  `ALTER TABLE \`teachers\` ADD COLUMN \`subject\` varchar(255);`,
  `ALTER TABLE \`teachers\` ADD COLUMN \`notes\` text;`,

  // 4. Alter unit_documents table
  `ALTER TABLE \`unit_documents\` ADD COLUMN \`is_visible\` boolean DEFAULT true NOT NULL;`,

  // 5. Add unique constraints & foreign keys
  `ALTER TABLE \`teachers\` ADD CONSTRAINT \`teachers_user_id_idx\` UNIQUE(\`user_id\`);`,
  `ALTER TABLE \`teachers\` ADD CONSTRAINT \`teachers_user_id_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL;`,
  `ALTER TABLE \`news\` ADD CONSTRAINT \`news_slug_idx\` UNIQUE(\`slug\`);`,

  // 6. Create indexes
  `CREATE INDEX \`unit_jk_docs_unit_slug_idx\` ON \`unit_jk_documents\` (\`unit_slug\`);`,
  `CREATE INDEX \`unit_jk_docs_jk_code_idx\` ON \`unit_jk_documents\` (\`jk_code\`);`,
  `CREATE INDEX \`unit_jk_docs_compound_idx\` ON \`unit_jk_documents\` (\`unit_slug\`,\`jk_code\`);`,
  `CREATE INDEX \`asrama_fasiliti_sort_order_idx\` ON \`asrama_fasiliti\` (\`sort_order\`);`,
  `CREATE INDEX \`user_role_idx\` ON \`user\` (\`role\`);`,
  `CREATE INDEX \`user_is_approved_idx\` ON \`user\` (\`is_approved\`);`,
];

async function main() {
  console.log(`Applying ${STATEMENTS.length} DDL statements to database...`);

  for (let i = 0; i < STATEMENTS.length; i++) {
    const stmt = STATEMENTS[i];
    try {
      await db.execute(sql.raw(stmt));
      console.log(`[OK] Statement ${i + 1}/${STATEMENTS.length}`);
    } catch (err: any) {
      const msg = err.message || "";
      const isDuplicate =
        msg.includes("Duplicate column name") ||
        msg.includes("Duplicate key name") ||
        msg.includes("already exists") ||
        msg.includes("Multiple primary key");

      if (isDuplicate) {
        console.log(`[SKIP - Already exists] Statement ${i + 1}/${STATEMENTS.length}`);
      } else {
        console.warn(`[WARN - Failed] Statement ${i + 1}/${STATEMENTS.length}:`, msg);
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
