"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { asramaPelajar } from "@/db/schema";
import { getSettings } from "@/lib/site-settings";

export async function fetchStudentsAction(password: string) {
  const settings = await getSettings();
  const actualPassword = settings.asramaPassword || "ASRAMA2026";
  
  if (password !== actualPassword) {
    return { success: false, error: "Kata laluan salah!" };
  }
  
  const allStudents = await db
    .select()
    .from(asramaPelajar)
    .where(eq(asramaPelajar.status, "active"))
    .orderBy(asramaPelajar.nama);
    
  // Format to be JSON-serializable
  const formatted = allStudents.map(student => ({
    id: student.id,
    nama: student.nama,
    jantina: student.jantina,
    tingkatan: student.tingkatan,
    dorm: student.dorm,
    noWaris: student.noWaris,
  }));
  
  return { success: true, data: formatted };
}
