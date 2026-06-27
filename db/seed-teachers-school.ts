import "dotenv/config";
import { db } from "./client";
import { teachers } from "./schema";

async function main() {
  await db.insert(teachers).values([
    {
      id: crypto.randomUUID(),
      name: "Hanizam binti Kassim",
      position: "Pengetua",
      photo: "/gallery/pentadbiran/pengetua-hanizam.png",
    },
    {
      id: crypto.randomUUID(),
      name: "Sharul Azman bin Jaafar",
      position: "Guru Penolong Kanan Pentadbiran",
      photo: "/gallery/pentadbiran/gpk-pentadbiran-sharul.png",
    },
    {
      id: crypto.randomUUID(),
      name: "Norliza binti Jais",
      position: "Guru Penolong Kanan Hal Ehwal Murid",
      photo: "/gallery/pentadbiran/gpk-hem-norliza.png",
    },
    {
      id: crypto.randomUUID(),
      name: "Masroha binti Abu",
      position: "Guru Penolong Kanan Kokurikulum",
      photo: "/gallery/pentadbiran/gpk-kokurikulum-masroha.png",
    },
    {
      id: crypto.randomUUID(),
      name: "Dr. Awaludin bin Ahmad",
      position: "Guru Penolong Kanan Tingkatan 6",
      photo: "/gallery/pentadbiran/gpk-tingkatan-6-awaludin.png",
    },
  ]);

  console.log("Seeded 5 administration teachers.");
  process.exit(0);
}

main();
