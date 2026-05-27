import type { CountryFlagColor } from "@geopoto/geo-data/flag-colors";

export const FLAG_COLOR_SWATCH_BY_COLOR = {
  black: "#111111",
  blue: "#2563eb",
  brown: "#8b5e34",
  gray: "#8a8f98",
  green: "#16a34a",
  orange: "#f97316",
  purple: "#9333ea",
  red: "#dc2626",
  white: "#ffffff",
  yellow: "#facc15",
} satisfies Readonly<Record<CountryFlagColor, string>>;
