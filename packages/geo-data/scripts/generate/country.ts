import type { GeoPath, GeoProjection } from "d3-geo";

import type { Continent, Country } from "../../src/countries.ts";
import type { LocalizedText } from "../../src/geo-language.ts";
import type { MapRegionName } from "../../src/map-definition.ts";
import { REST_COUNTRIES_TRANSLATION_CONFIG } from "./config.ts";
import { buildCountryCoreFeature } from "./country-core.ts";
import { buildCountryMap } from "./country-map.ts";
import { getOutlyingTerritoryCodes } from "./outlying-territory-config.ts";
import type { RestCountry } from "./rest-countries.ts";
import type { CountryFeature } from "./types.ts";

interface BuildCountryParams {
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountry: RestCountry;
  supplementalHighResolutionFeatureLookup: CountryFeatureLookup;
}

export interface CountryFeatureLookup {
  byName: ReadonlyMap<string, CountryFeature>;
  byNumericId: ReadonlyMap<string, readonly CountryFeature[]>;
}

interface FindCountryFeatureParams {
  featureLookup: CountryFeatureLookup;
  restCountry: RestCountry;
}

interface FindFeatureFromDuplicateNumericIdParams {
  candidates: readonly CountryFeature[];
  numericCountryCode: string;
  restCountry: RestCountry;
}

export function toContinent(country: RestCountry): Continent | null {
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

export function toMapRegions(
  country: RestCountry,
  continent: Continent,
): readonly MapRegionName[] {
  if (country.subregion === "Caribbean") {
    return ["world", continent, "caribbean"];
  }

  return ["world", continent];
}

export function toLocalizedCountryName(country: RestCountry): LocalizedText {
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

function toSourceFeatureName(feature: CountryFeature): string {
  return feature.properties.name ?? "unnamed source geometry";
}

function findFeatureFromDuplicateNumericId({
  candidates,
  numericCountryCode,
  restCountry,
}: FindFeatureFromDuplicateNumericIdParams): CountryFeature {
  const normalizedCountryName = normalizeCountryName(restCountry.name.common);
  const matchingFeature = candidates.find((candidate) => {
    const sourceName = candidate.properties.name;

    if (sourceName === undefined) {
      return false;
    }

    return normalizeCountryName(sourceName) === normalizedCountryName;
  });

  if (matchingFeature !== undefined) {
    return matchingFeature;
  }

  const candidateNames = candidates.map(toSourceFeatureName).join(", ");

  throw new Error(
    `Ambiguous source geometry for ${restCountry.cca2} (${restCountry.name.common}) with numeric id ${numericCountryCode}. Matching source names: ${candidateNames}`,
  );
}

export function findCountryFeature({
  featureLookup,
  restCountry,
}: FindCountryFeatureParams): CountryFeature | null {
  const numericCountryCode = toNumericCountryCode(restCountry);
  const featuresByCode =
    numericCountryCode === null
      ? []
      : (featureLookup.byNumericId.get(numericCountryCode) ?? []);

  if (featuresByCode.length === 1) {
    const [featureByCode] = featuresByCode;

    return featureByCode ?? null;
  }

  if (featuresByCode.length > 1 && numericCountryCode !== null) {
    return findFeatureFromDuplicateNumericId({
      candidates: featuresByCode,
      numericCountryCode,
      restCountry,
    });
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
  supplementalHighResolutionFeatureLookup,
}: BuildCountryParams): Country | null {
  const continent = toContinent(restCountry);

  if (continent === null) {
    return null;
  }

  const highResolutionFeature = buildCountryCoreFeature({
    countryCode: restCountry.cca2,
    feature:
      findCountryFeature({
        featureLookup: highResolutionFeatureLookup,
        restCountry,
      }) ??
      findCountryFeature({
        featureLookup: supplementalHighResolutionFeatureLookup,
        restCountry,
      }),
  });
  const lowResolutionFeature = buildCountryCoreFeature({
    countryCode: restCountry.cca2,
    feature: findCountryFeature({
      featureLookup: lowResolutionFeatureLookup,
      restCountry,
    }),
  });
  const outlyingTerritoryCodes = getOutlyingTerritoryCodes(restCountry.cca2);

  const country = {
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

  if (outlyingTerritoryCodes.length === 0) {
    return country;
  }

  return {
    ...country,
    outlyingTerritoryCodes,
  };
}
