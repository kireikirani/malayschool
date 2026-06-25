import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { user } from "./schema";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run db:seed-admin -- <email>");
    process.exit(1);
  }

  const result = await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
  if (result[0].affectedRows === 0) {
    console.error(`No user found with email ${email}. Sign up via /api/auth/sign-up/email first, then re-run this script.`);
    process.exit(1);
  }
  console.log(`Promoted ${email} to admin.`);
  process.exit(0);
}

main();
