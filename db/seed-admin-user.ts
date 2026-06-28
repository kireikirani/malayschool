import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "./client";
import { user } from "./schema";

async function main() {
  const email = process.argv[2] ?? "admin@malayschool.com";
  const password = process.argv[3] ?? "Admin123!";
  const name = process.argv[4] ?? "Admin";

  const existing = await db.select().from(user).where(eq(user.email, email));
  if (existing.length === 0) {
    await auth.api.signUpEmail({ body: { email, password, name } });
    console.log(`Created user ${email}.`);
  } else {
    console.log(`User ${email} already exists, skipping creation.`);
  }

  const result = await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
  if (result[0].affectedRows === 0) {
    console.error(`Failed to promote ${email} to admin.`);
    process.exit(1);
  }
  console.log(`Promoted ${email} to admin.`);
  process.exit(0);
}

main();
