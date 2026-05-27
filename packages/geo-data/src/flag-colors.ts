export const COUNTRY_FLAG_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "black",
  "white",
  "gray",
  "brown",
] as const;

export type CountryFlagColor = (typeof COUNTRY_FLAG_COLORS)[number];

export type CountryFlagColorCoverage = Partial<
  Record<CountryFlagColor, number>
>;
