import type { GeoPath, GeoProjection } from "d3-geo";

import type { Continent, Country } from "../../src/countries.ts";
import type { LocalizedText } from "../../src/geo-language.ts";
import type { MapRegionName } from "../../src/map-definition.ts";
import { REST_COUNTRIES_TRANSLATION_CONFIG } from "./config.ts";
import { buildCountryMap } from "./country-map.ts";
import type { RestCountry } from "./rest-countries.ts";
import type { CountryFeature } from "./types.ts";

interface BuildCountryParams {
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountry: RestCountry;
}

export interface CountryFeatureLookup {
  byName: ReadonlyMap<string, CountryFeature>;
  byNumericId: ReadonlyMap<string, CountryFeature>;
}

interface FindCountryFeatureParams {
  featureLookup: CountryFeatureLookup;
  restCountry: RestCountry;
}

function toContinent(country: RestCountry): Continent | null {
  switch (country.region) {
    case "Africa":
      return "africa";
    case "Americas":
      if (country.subregion === "South America") {
        return "south-america";
      }

      return "north-america";
    case "Asia":
      return "asia";
    case "Europe":
      return "europe";
    case "Oceania":
      return "oceania";
    default:
      return null;
  }
}

function toMapRegions(
  country: RestCountry,
  continent: Continent,
): readonly MapRegionName[] {
  if (country.subregion === "Caribbean") {
    return ["world", continent, "caribbean"];
  }

  return ["world", continent];
}

function toLocalizedCountryName(country: RestCountry): LocalizedText {
  return Object.fromEntries(
    REST_COUNTRIES_TRANSLATION_CONFIG.map(({ language, restCountriesCode }) => {
      const translatedName =
        restCountriesCode === null
          ? country.name.common
          : (country.translations[restCountriesCode]?.common ??
            country.name.common);

      return [language, translatedName];
    }),
  ) as LocalizedText;
}

function toLocalizedCapital(country: RestCountry): LocalizedText {
  const [capital] = country.capital;

  if (capital === undefined) {
    throw new Error(`Missing capital for ${country.cca2}`);
  }

  return Object.fromEntries(
    REST_COUNTRIES_TRANSLATION_CONFIG.map(({ language }) => [
      language,
      capital,
    ]),
  ) as LocalizedText;
}

export function normalizeCountryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toNumericCountryCode(country: RestCountry): string | null {
  if (country.ccn3 === null) {
    return null;
  }

  return country.ccn3.padStart(3, "0");
}

function findCountryFeature({
  featureLookup,
  restCountry,
}: FindCountryFeatureParams): CountryFeature | null {
  const numericCountryCode = toNumericCountryCode(restCountry);
  const featureByCode =
    numericCountryCode === null
      ? null
      : featureLookup.byNumericId.get(numericCountryCode);

  if (featureByCode !== undefined && featureByCode !== null) {
    return featureByCode;
  }

  return (
    featureLookup.byName.get(normalizeCountryName(restCountry.name.common)) ??
    null
  );
}

export function buildCountry({
  highResolutionFeatureLookup,
  lowResolutionFeatureLookup,
  pathGenerator,
  projection,
  restCountry,
}: BuildCountryParams): Country | null {
  const continent = toContinent(restCountry);

  if (continent === null) {
    return null;
  }

  const highResolutionFeature = findCountryFeature({
    featureLookup: highResolutionFeatureLookup,
    restCountry,
  });
  const lowResolutionFeature = findCountryFeature({
    featureLookup: lowResolutionFeatureLookup,
    restCountry,
  });

  return {
    capital: toLocalizedCapital(restCountry),
    code: restCountry.cca2,
    continent,
    map: buildCountryMap({
      highResolutionFeature,
      lowResolutionFeature,
      pathGenerator,
      projection,
      restCountry,
    }),
    name: toLocalizedCountryName(restCountry),
    regions: toMapRegions(restCountry, continent),
  };
}
