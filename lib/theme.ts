export type ThemeColor = "navy" | "green" | "maroon" | "teal";

export const THEME_PRESETS: Record<ThemeColor, { label: string; primary: string; primaryFg: string }> = {
  navy: {
    label: "Biru Tentera (Default)",
    primary: "oklch(0.228 0.093 263.9)",
    primaryFg: "oklch(0.997 0 89.9)",
  },
  green: {
    label: "Hijau",
    primary: "oklch(0.35 0.12 145)",
    primaryFg: "oklch(0.97 0 0)",
  },
  maroon: {
    label: "Merah Hati",
    primary: "oklch(0.35 0.14 15)",
    primaryFg: "oklch(0.97 0 0)",
  },
  teal: {
    label: "Teal",
    primary: "oklch(0.38 0.10 195)",
    primaryFg: "oklch(0.97 0 0)",
  },
};
