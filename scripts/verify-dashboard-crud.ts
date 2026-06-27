import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { advertisements, galleryAlbums, media, news, teachers } from "@/db/schema";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function verifyNewsCrud() {
  const id = nowId("news");
  const slug = nowId("slug");

  await db.insert(news).values({
    id,
    title: "Smoke News",
    slug,
    content: "<p>Smoke test content</p>",
    status: "draft",
  });

  const [created] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (!created) throw new Error("News create failed");

  await db.update(news).set({ title: "Smoke News Updated" }).where(eq(news.id, id));
  const [updated] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (updated?.title !== "Smoke News Updated") throw new Error("News update failed");

  await db.delete(news).where(eq(news.id, id));
  const [deleted] = await db.select().from(news).where(eq(news.id, id)).limit(1);
  if (deleted) throw new Error("News delete failed");
}

async function verifyGalleryCrud() {
  const id = nowId("album");

  await db.insert(galleryAlbums).values({
    id,
    name: "Smoke Album",
    description: "Smoke description",
  });

  const [created] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
  if (!created) throw new Error("Gallery create failed");

  await db.update(galleryAlbums).set({ name: "Smoke Album Updated" }).where(eq(galleryAlbums.id, id));
  const [updated] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
  if (updated?.name !== "Smoke Album Updated") throw new Error("Gallery update failed");

  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
  const [deleted] = await db.select().from(galleryAlbums).where(eq(galleryAlbums.id, id)).limit(1);
  if (deleted) throw new Error("Gallery delete failed");
}

async function verifyTeacherCrud() {
  const id = nowId("teacher");

  await db.insert(teachers).values({
    id,
    name: "Smoke Teacher",
    position: "Tester",
    biography: "Smoke biography",
    status: "active",
  });

  const [created] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  if (!created) throw new Error("Teacher create failed");

  await db.update(teachers).set({ position: "Tester Updated" }).where(eq(teachers.id, id));
  const [updated] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  if (updated?.position !== "Tester Updated") throw new Error("Teacher update failed");

  await db.delete(teachers).where(eq(teachers.id, id));
  const [deleted] = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  if (deleted) throw new Error("Teacher delete failed");
}

async function verifyAdvertisementCrud() {
  const id = nowId("ad");

  await db.insert(advertisements).values({
    id,
    name: "Smoke Ad",
    type: "external_link",
    placement: "footer",
    content: "https://example.com",
    status: "inactive",
  });

  const [created] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (!created) throw new Error("Advertisement create failed");

  await db.update(advertisements).set({ status: "active" }).where(eq(advertisements.id, id));
  const [updated] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (updated?.status !== "active") throw new Error("Advertisement update failed");

  await db.delete(advertisements).where(eq(advertisements.id, id));
  const [deleted] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (deleted) throw new Error("Advertisement delete failed");
}

async function verifyMediaCrud() {
  const id = nowId("media");

  await db.insert(media).values({
    id,
    fileName: "smoke.txt",
    filePath: "/smoke/smoke.txt",
    fileKey: nowId("filekey"),
    fileType: "text/plain",
    fileSize: 128,
    folder: "documents",
  });

  const [created] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!created) throw new Error("Media create failed");

  await db.update(media).set({ folder: "general" }).where(eq(media.id, id));
  const [updated] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (updated?.folder !== "general") throw new Error("Media update failed");

  await db.delete(media).where(eq(media.id, id));
  const [deleted] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (deleted) throw new Error("Media delete failed");
}

async function main() {
  const checks = [
    ["news", verifyNewsCrud],
    ["gallery_albums", verifyGalleryCrud],
    ["teachers", verifyTeacherCrud],
    ["advertisements", verifyAdvertisementCrud],
    ["media", verifyMediaCrud],
  ] as const;

  for (const [label, check] of checks) {
    await check();
    console.log(`PASS ${label}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
