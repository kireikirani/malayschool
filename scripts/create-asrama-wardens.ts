import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`asrama_wardens\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`teacher_id\` varchar(36) NOT NULL,
    \`jawatan\` varchar(200) NOT NULL,
    \`sort_order\` int NOT NULL DEFAULT 0,
    \`created_at\` timestamp NOT NULL DEFAULT NOW(),
    \`updated_at\` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT \`asrama_wardens_id\` PRIMARY KEY(\`id\`)
  );`,
  `CREATE INDEX \`asrama_wardens_teacher_id_idx\` ON \`asrama_wardens\` (\`teacher_id\`);`,
  `CREATE INDEX \`asrama_wardens_sort_order_idx\` ON \`asrama_wardens\` (\`sort_order\`);`,
  `ALTER TABLE \`asrama_wardens\` ADD CONSTRAINT \`asrama_wardens_teacher_id_fk\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE CASCADE;`,
];

async function main() {
  for (let i = 0; i < STATEMENTS.length; i++) {
    try {
      await db.execute(sql.raw(STATEMENTS[i]));
      console.log(`[OK] ${i + 1}/${STATEMENTS.length}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("Duplicate")) {
        console.log(`[SKIP] ${i + 1}/${STATEMENTS.length}`);
      } else {
        console.warn(`[WARN] ${i + 1}/${STATEMENTS.length}: ${msg}`);
      }
    }
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
