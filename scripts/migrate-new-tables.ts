import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  console.log("Creating asrama_wardens table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS \`asrama_wardens\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`nama\` varchar(200) NOT NULL,
      \`jawatan\` varchar(200) NOT NULL,
      \`telefon\` varchar(50),
      \`foto\` varchar(2048),
      \`sort_order\` int NOT NULL DEFAULT 0,
      \`created_at\` timestamp NOT NULL DEFAULT NOW(),
      \`updated_at\` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      CONSTRAINT \`asrama_wardens_id\` PRIMARY KEY (\`id\`)
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS \`asrama_wardens_sort_order_idx\` ON \`asrama_wardens\` (\`sort_order\`)
  `);

  console.log("Creating asrama_fasiliti table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS \`asrama_fasiliti\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`icon_name\` varchar(100) NOT NULL,
      \`label\` varchar(200) NOT NULL,
      \`sort_order\` int NOT NULL DEFAULT 0,
      \`created_at\` timestamp NOT NULL DEFAULT NOW(),
      \`updated_at\` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      CONSTRAINT \`asrama_fasiliti_id\` PRIMARY KEY (\`id\`)
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS \`asrama_fasiliti_sort_order_idx\` ON \`asrama_fasiliti\` (\`sort_order\`)
  `);

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
