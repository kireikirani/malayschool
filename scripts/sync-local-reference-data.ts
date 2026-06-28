import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryAlbums, galleryItems, teachers } from "@/db/schema";

type AlbumSeed = {
  name: string;
  description: string;
  coverImage: string;
  items: Array<{
    image: string;
    caption: string;
    order: number;
  }>;
};

const gallerySeed: AlbumSeed[] = [
  {
    name: "Foto Sekolah",
    description: "Bangunan dan persekitaran SMK Telok Panglima Garang.",
    coverImage: "/gallery/sekolah/bangunan-sekolah.jpg",
    items: [
      {
        image: "/gallery/sekolah/bangunan-sekolah.jpg",
        caption: "Bangunan utama SMK Telok Panglima Garang",
        order: 0,
      },
    ],
  },
  {
    name: "Pentadbiran Sekolah",
    description: "Pengetua dan Guru Penolong Kanan SMK Telok Panglima Garang.",
    coverImage: "/gallery/pentadbiran/pengetua-hanizam.png",
    items: [
      {
        image: "/gallery/pentadbiran/pengetua-hanizam.png",
        caption: "Hanizam binti Kassim — Pengetua",
        order: 0,
      },
      {
        image: "/gallery/pentadbiran/gpk-pentadbiran-sharul.png",
        caption: "Sharul Azman bin Jaafar — GPK Pentadbiran",
        order: 1,
      },
      {
        image: "/gallery/pentadbiran/gpk-hem-norliza.png",
        caption: "Norliza binti Jais — GPK Hal Ehwal Murid",
        order: 2,
      },
      {
        image: "/gallery/pentadbiran/gpk-kokurikulum-masroha.png",
        caption: "Masroha binti Abu — GPK Kokurikulum",
        order: 3,
      },
      {
        image: "/gallery/pentadbiran/gpk-tingkatan-6-awaludin.png",
        caption: "Dr. Awaludin bin Ahmad — GPK Tingkatan 6",
        order: 4,
      },
    ],
  },
];

const teacherSeed = [
  {
    name: "Hanizam binti Kassim",
    position: "Pengetua",
    photo: "/gallery/pentadbiran/pengetua-hanizam.png",
  },
  {
    name: "Sharul Azman bin Jaafar",
    position: "Guru Penolong Kanan Pentadbiran",
    photo: "/gallery/pentadbiran/gpk-pentadbiran-sharul.png",
  },
  {
    name: "Norliza binti Jais",
    position: "Guru Penolong Kanan Hal Ehwal Murid",
    photo: "/gallery/pentadbiran/gpk-hem-norliza.png",
  },
  {
    name: "Masroha binti Abu",
    position: "Guru Penolong Kanan Kokurikulum",
    photo: "/gallery/pentadbiran/gpk-kokurikulum-masroha.png",
  },
  {
    name: "Dr. Awaludin bin Ahmad",
    position: "Guru Penolong Kanan Tingkatan 6",
    photo: "/gallery/pentadbiran/gpk-tingkatan-6-awaludin.png",
  },
];

function createId() {
  return crypto.randomUUID();
}

async function syncAlbums() {
  for (const album of gallerySeed) {
    let [existingAlbum] = await db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.name, album.name))
      .limit(1);

    if (!existingAlbum) {
      const id = createId();

      await db.insert(galleryAlbums).values({
        id,
        name: album.name,
        description: album.description,
        coverImage: album.coverImage,
      });

      [existingAlbum] = await db
        .select()
        .from(galleryAlbums)
        .where(eq(galleryAlbums.id, id))
        .limit(1);

      console.log(`INSERT album: ${album.name}`);
    } else {
      await db
        .update(galleryAlbums)
        .set({
          description: album.description,
          coverImage: album.coverImage,
        })
        .where(eq(galleryAlbums.id, existingAlbum.id));

      console.log(`UPDATE album: ${album.name}`);
    }

    if (!existingAlbum) {
      throw new Error(`Album sync failed for ${album.name}`);
    }

    for (const item of album.items) {
      const [existingItem] = await db
        .select()
        .from(galleryItems)
        .where(and(eq(galleryItems.albumId, existingAlbum.id), eq(galleryItems.image, item.image)))
        .limit(1);

      if (!existingItem) {
        await db.insert(galleryItems).values({
          id: createId(),
          albumId: existingAlbum.id,
          image: item.image,
          caption: item.caption,
          order: item.order,
        });

        console.log(`INSERT gallery item: ${item.image}`);
      } else {
        await db
          .update(galleryItems)
          .set({
            caption: item.caption,
            order: item.order,
          })
          .where(eq(galleryItems.id, existingItem.id));

        console.log(`UPDATE gallery item: ${item.image}`);
      }
    }
  }
}

async function syncTeachers() {
  for (const teacher of teacherSeed) {
    const [existingTeacher] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.name, teacher.name))
      .limit(1);

    if (!existingTeacher) {
      await db.insert(teachers).values({
        id: createId(),
        name: teacher.name,
        position: teacher.position,
        photo: teacher.photo,
        status: "active",
      });

      console.log(`INSERT teacher: ${teacher.name}`);
    } else {
      await db
        .update(teachers)
        .set({
          position: teacher.position,
          photo: teacher.photo,
          status: "active",
        })
        .where(eq(teachers.id, existingTeacher.id));

      console.log(`UPDATE teacher: ${teacher.name}`);
    }
  }
}

async function verify() {
  const syncedAlbums = await db.select().from(galleryAlbums);
  const syncedItems = await db.select().from(galleryItems);
  const syncedTeachers = await db.select().from(teachers);

  if (syncedAlbums.length < gallerySeed.length) {
    throw new Error(`Album count mismatch: expected at least ${gallerySeed.length}, got ${syncedAlbums.length}`);
  }

  const expectedItemCount = gallerySeed.reduce((total, album) => total + album.items.length, 0);
  if (syncedItems.length < expectedItemCount) {
    throw new Error(`Gallery item count mismatch: expected at least ${expectedItemCount}, got ${syncedItems.length}`);
  }

  if (syncedTeachers.length < teacherSeed.length) {
    throw new Error(`Teacher count mismatch: expected at least ${teacherSeed.length}, got ${syncedTeachers.length}`);
  }
}

async function main() {
  await syncAlbums();
  await syncTeachers();
  await verify();

  console.log("SYNC OK local reference data is present in the online database.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
