import "dotenv/config";
import mysql from "mysql2/promise";

const CREATE_ASRAMA_WARDENS = `
CREATE TABLE IF NOT EXISTS \`asrama_wardens\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`teacher_id\` varchar(36) NOT NULL,
  \`jawatan\` varchar(200) NOT NULL,
  \`sort_order\` int NOT NULL DEFAULT 0,
  \`created_at\` timestamp NOT NULL DEFAULT (now()),
  \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`asrama_wardens_id\` PRIMARY KEY(\`id\`),
  CONSTRAINT \`asrama_wardens_teacher_id_teachers_id_fk\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE cascade
);
`;

const IDX1 = "CREATE INDEX `asrama_wardens_teacher_id_idx` ON `asrama_wardens` (`teacher_id`);";
const IDX2 = "CREATE INDEX `asrama_wardens_sort_order_idx` ON `asrama_wardens` (`sort_order`);";

async function main() {
  const url = process.env.DATABASE_URL!;
  const conn = await mysql.createConnection({
    uri: url,
    ssl: url.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  });

  console.log("Creating asrama_wardens...");
  await conn.query(CREATE_ASRAMA_WARDENS);

  for (const idx of [IDX1, IDX2]) {
    try {
      await conn.query(idx);
      console.log("OK:", idx);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === "ER_DUP_KEYNAME") console.log("skip (exists):", idx);
      else throw e;
    }
  }

  console.log("Done.");
  await conn.end();
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
