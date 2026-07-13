import "dotenv/config";
import { db } from "@/lib/db";
import { asramaWardens } from "@/db/schema";

async function main() {
  const r = await db.select().from(asramaWardens);
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
}
main();
