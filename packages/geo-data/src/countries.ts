export type Continent = "africa" | "americas" | "asia" | "europe" | "oceania";

export interface LocalizedText {
  de: string;
  en: string;
  es: string;
  fr: string;
  it: string;
  pt: string;
}

export interface Country {
  capital: LocalizedText;
  code: string;
  continent: Continent;
  coordinates: readonly [number, number];
  name: LocalizedText;
}

export const continents: readonly Continent[] = [
  "africa",
  "americas",
  "asia",
  "europe",
  "oceania",
];

export const countries: readonly Country[] = [];
