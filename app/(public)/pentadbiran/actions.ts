"use server";

import { getSettings } from "@/lib/site-settings";
import { getUnitSections } from "@/lib/content";
import { UNITS } from "@/lib/units";

export async function fetchPentadbiranDataAction(password: string) {
  const settings = await getSettings();
  const actualPassword = settings.pentadbiranPassword || "PENTADBIRAN2026";
  
  if (password !== actualPassword) {
    return { success: false, error: "Kata laluan salah!" };
  }
  
  const unit = UNITS.find((u) => u.slug === "pentadbiran")!;
  const sections = await getUnitSections("pentadbiran");
  
  // Format dates/timestamps to be JSON-serializable
  const formattedSections = sections.map((sec) => ({
    ...sec,
    items: sec.items.map((item) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    })),
  }));

  return {
    success: true,
    data: {
      unit: {
        title: unit.title,
        headName: unit.headName,
        headPosition: unit.headPosition,
        pencapaian: unit.pencapaian || [],
      },
      sections: formattedSections,
    },
  };
}
