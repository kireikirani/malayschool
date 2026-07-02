import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { getMigrationConfig } from "./config";
import type { LegacyPayload } from "./types";
import { getTransformedPayloadPath, logDryRun, readJsonFile } from "./utils";

export async function loadUsers(rows: LegacyPayload["users"], dryRun = false) {
  const adminRows = rows.filter((row) => row.role === "admin");

  for (const row of adminRows) {
    if (dryRun) {
      logDryRun("user", row);
      continue;
    }

    await db.insert(user).values(row).onDuplicateKeyUpdate({
      set: {
        name: row.name,
        email: row.email,
        role: row.role,
        emailVerified: row.emailVerified,
        image: row.image,
      },
    });
  }

  return adminRows.length;
}

async function main() {
  const config = getMigrationConfig();
  const payload = await readJsonFile<LegacyPayload>(getTransformedPayloadPath());
  const count = await loadUsers(payload.users, config.dryRun);
  console.log(`${config.dryRun ? "Previewed" : "Loaded"} ${count} admin users`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
