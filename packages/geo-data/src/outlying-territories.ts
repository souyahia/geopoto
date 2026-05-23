import outlyingTerritoriesData from "../generated/outlying-territories.json";
import type { Continent } from "./countries";
import type { LocalizedText } from "./geo-language";
import type { CountryMap, MapRegionName } from "./map-definition";

export interface OutlyingTerritory {
  code: string;
  continent: Continent;
  countryCode: string;
  map: CountryMap;
  name: LocalizedText;
  regions: readonly MapRegionName[];
}

export const OUTLYING_TERRITORIES =
  outlyingTerritoriesData as readonly OutlyingTerritory[];
