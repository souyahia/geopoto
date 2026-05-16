import countriesData from "../generated/countries.json";
import { type LocalizedText } from "./geo-language";
import { type CountryMap, type MapRegionName } from "./map-definition";

export const CONTINENTS = [
  "africa",
  "south-america",
  "north-america",
  "asia",
  "europe",
  "oceania",
] as const;

export type Continent = (typeof CONTINENTS)[number];

export function isContinent(value: unknown): value is Continent {
  return CONTINENTS.includes(value as Continent);
}

export interface Country {
  code: string;
  continent: Continent;
  capital: LocalizedText;
  map: CountryMap;
  name: LocalizedText;
  regions: readonly MapRegionName[];
}

export const COUNTRIES = countriesData as readonly Country[];
