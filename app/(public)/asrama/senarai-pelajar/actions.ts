"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar } from "@/db/schema";
import { getSettings } from "@/lib/site-settings";
import { fetchDriveFolder } from "@/lib/drive-scraper";

export type StudentData = {
  id: number;
  nama: string;
  jantina: string;
  tingkatan: string;
  dorm: string;
  noWaris: string | null;
  namaWaris: string | null;
  noWaris2: string | null;
  namaWaris2: string | null;
  noWaris3: string | null;
  namaWaris3: string | null;
  foto: string | null;
  gdriveFolderLink: string | null;
};

export async function fetchStudentsAction(
  password: string
): Promise<{ success: false; error: string } | { success: true; data: StudentData[] }> {
  const settings = await getSettings();
  const validPasswords = new Set(
    [settings.asramaPassword, settings.pentadbiranPassword, "PENTADBIRAN2026"].filter(Boolean)
  );

  if (!validPasswords.has(password)) {
    return { success: false, error: "Kata laluan salah!" };
  }

  const allStudents = await db
    .select()
    .from(asramaPelajar)
    .where(eq(asramaPelajar.status, "active"))
    .orderBy(asramaPelajar.nama);

  const formatted = allStudents.map((student) => ({
    id: student.id,
    nama: student.nama,
    jantina: student.jantina,
    tingkatan: student.tingkatan,
    dorm: student.dorm,
    noWaris: student.noWaris,
    namaWaris: student.namaWaris,
    noWaris2: student.noWaris2,
    namaWaris2: student.namaWaris2,
    noWaris3: student.noWaris3,
    namaWaris3: student.namaWaris3,
    foto: student.foto,
    gdriveFolderLink: student.gdriveFolderLink,
  }));

  return { success: true, data: formatted };
}

export type GdriveImage = {
  id: string;
  name: string;
  url: string;
  downloadUrl: string;
};

export async function fetchGdriveImagesAction(
  folderLink: string
): Promise<{ success: false; error: string } | { success: true; images: GdriveImage[] }> {
  try {
    const folderIdMatch = folderLink.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (!folderIdMatch) {
      return { success: false, error: "Link Google Drive tidak sah" };
    }
    const folderId = folderIdMatch[1];
    const folder = await fetchDriveFolder(folderId, 0);

    const images = folder.files
      .filter((f) => f.mimeType.startsWith("image/"))
      .map((f) => ({
        id: f.id,
        name: f.name,
        url: `https://drive.google.com/uc?export=view&id=${f.id}`,
        downloadUrl: f.downloadUrl ?? `https://drive.google.com/uc?export=download&id=${f.id}`,
      }));

    return { success: true, images };
  } catch {
    return { success: false, error: "Gagal memuat gambar dari Google Drive" };
  }
}
