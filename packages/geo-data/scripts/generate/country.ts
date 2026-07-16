import type { GeoPath, GeoProjection } from "d3-geo";

import type { Continent, Country } from "../../src/countries.ts";
import type {
  LocalizedText,
  SupportedGeoLanguage,
} from "../../src/geo-language.ts";
import type { MapRegionName } from "../../src/map-definition.ts";
import { REST_COUNTRIES_TRANSLATION_CONFIG } from "./config.ts";
import {
  getCountryCapitalAliases,
  getCountryNameAliases,
} from "./country-aliases-config.ts";
import { buildCountryCoreFeature } from "./country-core.ts";
import { buildCountryMap } from "./country-map.ts";
import { getCountryNameOverride } from "./country-name-overrides-config.ts";
import { buildCountryPressArea } from "./country-press-area.ts";
import { buildLocalizedText } from "./localized-text.ts";
import { getOutlyingTerritoryCodes } from "./outlying-territory-config.ts";
import type { RestCountry } from "./rest-countries.ts";
import type { CountryFeature } from "./types.ts";
import type {
  WikidataCapitalLabels,
  WikidataCapitalLabelsByCountryCode,
} from "./wikidata-capitals.ts";

interface BuildCountryParams {
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountry: RestCountry;
  supplementalHighResolutionFeatureLookup: CountryFeatureLookup;
  wikidataCapitalLabelsByCountryCode: WikidataCapitalLabelsByCountryCode;
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

interface GetLocalizedCountryNameParams {
  country: RestCountry;
  language: SupportedGeoLanguage;
}

interface ToLocalizedCapitalParams {
  country: RestCountry;
  wikidataCapitalLabelsByCountryCode: WikidataCapitalLabelsByCountryCode;
}

interface FindWikidataCapitalLabelsParams {
  capital: string;
  countryCode: string;
  wikidataCapitalLabelsByCountryCode: WikidataCapitalLabelsByCountryCode;
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
  return buildLocalizedText({
    getValue: (language) =>
      getLocalizedCountryName({
        country,
        language,
      }),
  });
}

function getLocalizedCountryName({
  country,
  language,
}: GetLocalizedCountryNameParams): string {
  const nameOverride = getCountryNameOverride({
    countryCode: country.cca2,
    language,
  });

  if (nameOverride !== undefined) {
    return nameOverride;
  }

  const translationConfig = REST_COUNTRIES_TRANSLATION_CONFIG.find(
    (config) => config.language === language,
  );

  if (translationConfig === undefined) {
    throw new Error(`Missing RestCountries translation config for ${language}`);
  }

  if (translationConfig.restCountriesCode === null) {
    return country.name.common;
  }

  return (
    country.translations[translationConfig.restCountriesCode]?.common ??
    country.name.common
  );
}

function toLocalizedCapital({
  country,
  wikidataCapitalLabelsByCountryCode,
}: ToLocalizedCapitalParams): LocalizedText {
  const [capital] = country.capital;

  if (capital === undefined) {
    throw new Error(`Missing capital for ${country.cca2}`);
  }

  const wikidataCapitalLabels = findWikidataCapitalLabels({
    capital,
    countryCode: country.cca2,
    wikidataCapitalLabelsByCountryCode,
  });

  return buildLocalizedText({
    getValue: (language) => {
      if (language === "en") {
        return capital;
      }

      return wikidataCapitalLabels?.labels[language] ?? capital;
    },
  });
}

function findWikidataCapitalLabels({
  capital,
  countryCode,
  wikidataCapitalLabelsByCountryCode,
}: FindWikidataCapitalLabelsParams): WikidataCapitalLabels | null {
  const capitalLabels = wikidataCapitalLabelsByCountryCode.get(countryCode);

  if (capitalLabels === undefined) {
    return null;
  }

  const normalizedCapital = normalizeCapitalName(capital);
  const matchingCapitalLabels = capitalLabels.find((candidate) => {
    const englishLabel = candidate.labels.en;

    if (englishLabel === undefined) {
      return false;
    }

    return normalizeCapitalName(englishLabel) === normalizedCapital;
  });

  return matchingCapitalLabels ?? capitalLabels.at(0) ?? null;
}

export function normalizeCountryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeCapitalName(name: string): string {
  return normalizeCountryName(name).replace(/[^\p{Letter}\p{Number}]/gu, "");
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
  wikidataCapitalLabelsByCountryCode,
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
  const capitalAliases = getCountryCapitalAliases(restCountry.cca2);
  const nameAliases = getCountryNameAliases(restCountry.cca2);
  const map = buildCountryMap({
    highResolutionFeature,
    lowResolutionFeature,
    pathGenerator,
    projection,
    restCountry,
  });
  const countryPressArea = buildCountryPressArea({
    countryCode: restCountry.cca2,
    mapBounds: map.bounds,
  });

  const country = {
    capital: toLocalizedCapital({
      country: restCountry,
      wikidataCapitalLabelsByCountryCode,
    }),
    ...(capitalAliases === undefined ? {} : { capitalAliases }),
    code: restCountry.cca2,
    continent,
    ...(countryPressArea === undefined ? {} : { countryPressArea }),
    map,
    name: toLocalizedCountryName(restCountry),
    ...(nameAliases === undefined ? {} : { nameAliases }),
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
