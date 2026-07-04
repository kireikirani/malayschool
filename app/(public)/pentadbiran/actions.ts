"use server";

import { getSettings } from "@/lib/site-settings";
import { getUnitSections } from "@/lib/content";
import { UNITS } from "@/lib/units";

const MANAGEMENT_UNIT_SLUGS = new Set([
  "pentadbiran",
  "kurikulum",
  "hem",
  "kokurikulum",
  "tingkatan-6",
]);

export async function fetchManagementDataAction(slug: string, password: string) {
  if (!MANAGEMENT_UNIT_SLUGS.has(slug)) {
    return { success: false, error: "Halaman tidak sah." };
  }

  const settings = await getSettings();
  const actualPassword = settings.pentadbiranPassword || "PENTADBIRAN2026";

  if (password !== actualPassword) {
    return { success: false, error: "Kata laluan salah!" };
  }

  const unit = UNITS.find((item) => item.slug === slug);
  if (!unit) {
    return { success: false, error: "Maklumat unit tidak ditemui." };
  }

  const sections = await getUnitSections(slug);
  const formattedSections = sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    })),
  }));

  return {
    success: true,
    data: {
      unit: {
        slug: unit.slug,
        navLabel: unit.navLabel,
        title: unit.title,
        headName: unit.headName,
        headPosition: unit.headPosition,
        pencapaian: unit.pencapaian || [],
      },
      sections: formattedSections,
    },
  };
}

export async function fetchPentadbiranDataAction(password: string) {
  return fetchManagementDataAction("pentadbiran", password);
}
