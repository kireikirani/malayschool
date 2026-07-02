require("dotenv").config();
const mysql = require("mysql2/promise");

const STATEMENTS = [
  "ALTER TABLE `account` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `account` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `advertisements` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `advertisements` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `asrama_pelajar` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `asrama_pelajar` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `gallery_albums` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `gallery_albums` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `gallery_items` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `media` MODIFY COLUMN `uploaded_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `news` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `news` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `pengumuman` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `pengumuman` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `public_content` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `public_content` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `public_content_items` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `public_content_items` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `session` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `session` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `site_settings` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `teachers` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `teachers` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `unit_documents` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `unit_documents` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `unit_jk_members` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `unit_jk_members` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `unit_section_items` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `unit_section_items` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `unit_sections` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `unit_sections` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `user` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `user` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `verification` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());",
  "ALTER TABLE `verification` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;",
  "ALTER TABLE `account` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `advertisements` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `asrama_pelajar` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `gallery_albums` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `gallery_items` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `media` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `news` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `pengumuman` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `public_content` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `public_content_items` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `session` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `site_settings` ADD PRIMARY KEY(`key`);",
  "ALTER TABLE `teachers` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `unit_documents` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `unit_jk_members` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `unit_section_items` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `unit_sections` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `user` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `verification` ADD PRIMARY KEY(`id`);",
  "ALTER TABLE `news` ADD CONSTRAINT `news_slug_idx` UNIQUE(`slug`);",
  "ALTER TABLE `session` ADD CONSTRAINT `session_token_idx` UNIQUE(`token`);",
  "ALTER TABLE `user` ADD CONSTRAINT `user_email_idx` UNIQUE(`email`);"
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    return;
  }

  const conn = await mysql.createConnection({
    uri: databaseUrl,
    ssl: databaseUrl.includes("tidbcloud.com") ? { rejectUnauthorized: true } : undefined,
  });

  try {
    console.log(`Starting execution of ${STATEMENTS.length} DDL statements...`);
    for (let i = 0; i < STATEMENTS.length; i++) {
      const sql = STATEMENTS[i];
      try {
        await conn.query(sql);
        console.log(`[OK] Statement ${i + 1}/${STATEMENTS.length}`);
      } catch (err) {
        // Ignore duplicate primary key or column or index errors
        const isDuplicateKey = err.code === "ER_MULTIPLE_PRI_KEY" || err.sqlMessage?.includes("Multiple primary key");
        const isDuplicateIndex = err.code === "ER_DUP_KEYNAME" || err.sqlMessage?.includes("Duplicate key name");
        if (isDuplicateKey || isDuplicateIndex) {
          console.log(`[SKIP - Already exists] Statement ${i + 1}/${STATEMENTS.length}`);
        } else {
          console.warn(`[WARN - Query error] Statement ${i + 1}/${STATEMENTS.length} failed:`, err.sqlMessage || err.message);
        }
      }
    }
    console.log("DDL execution finished.");
  } catch (error) {
    console.error("Critical error in migration runner:", error);
  } finally {
    await conn.end();
  }
}

main();
