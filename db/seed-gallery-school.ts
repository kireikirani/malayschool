import "dotenv/config";
import { db } from "./client";
import { galleryAlbums, galleryItems } from "./schema";

async function main() {
  const sekolahAlbumId = crypto.randomUUID();
  const pentadbiranAlbumId = crypto.randomUUID();

  await db.insert(galleryAlbums).values([
    {
      id: sekolahAlbumId,
      name: "Foto Sekolah",
      description: "Bangunan dan persekitaran SMK Telok Panglima Garang.",
      coverImage: "/gallery/sekolah/bangunan-sekolah.jpg",
    },
    {
      id: pentadbiranAlbumId,
      name: "Pentadbiran Sekolah",
      description: "Pengetua dan Guru Penolong Kanan SMK Telok Panglima Garang.",
      coverImage: "/gallery/pentadbiran/pengetua-hanizam.png",
    },
  ]);

  await db.insert(galleryItems).values([
    {
      id: crypto.randomUUID(),
      albumId: sekolahAlbumId,
      image: "/gallery/sekolah/bangunan-sekolah.jpg",
      caption: "Bangunan utama SMK Telok Panglima Garang",
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      albumId: pentadbiranAlbumId,
      image: "/gallery/pentadbiran/pengetua-hanizam.png",
      caption: "Hanizam binti Kassim — Pengetua",
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      albumId: pentadbiranAlbumId,
      image: "/gallery/pentadbiran/gpk-pentadbiran-sharul.png",
      caption: "Sharul Azman bin Jaafar — GPK Pentadbiran",
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      albumId: pentadbiranAlbumId,
      image: "/gallery/pentadbiran/gpk-hem-norliza.png",
      caption: "Norliza binti Jais — GPK Hal Ehwal Murid",
      order: 2,
    },
    {
      id: crypto.randomUUID(),
      albumId: pentadbiranAlbumId,
      image: "/gallery/pentadbiran/gpk-kokurikulum-masroha.png",
      caption: "Masroha binti Abu — GPK Kokurikulum",
      order: 3,
    },
    {
      id: crypto.randomUUID(),
      albumId: pentadbiranAlbumId,
      image: "/gallery/pentadbiran/gpk-tingkatan-6-awaludin.png",
      caption: "Dr. Awaludin bin Ahmad — GPK Tingkatan 6",
      order: 4,
    },
  ]);

  console.log("Seeded gallery albums: Foto Sekolah, Pentadbiran Sekolah");
  process.exit(0);
}

main();
