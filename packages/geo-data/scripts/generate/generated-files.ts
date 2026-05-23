import { resolve } from "node:path";

import type { Country } from "../../src/countries.ts";
import { SUPPORTED_GEO_LANGUAGES } from "../../src/geo-language.ts";
import type { MapRegion } from "../../src/map-definition.ts";
import type { OutlyingTerritory } from "../../src/outlying-territories.ts";
import { GENERATED_DIRECTORY } from "./config.ts";
import type { GeneratedJsonFile } from "./types.ts";

interface BuildGeneratedDataParams {
  countries: readonly Country[];
  countryFlags: Readonly<Record<string, unknown>>;
  mapRegions: readonly MapRegion[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

function toCountrySummary(country: Country) {
  return {
    capital: country.capital,
    code: country.code,
    continent: country.continent,
    name: country.name,
    regions: country.regions,
  };
}

function buildCountrySummaryCodesByName(countries: readonly Country[]) {
  return Object.fromEntries(
    SUPPORTED_GEO_LANGUAGES.map((geoLang) => [
      geoLang,
      countries
        .toSorted((left, right) =>
          left.name[geoLang].localeCompare(right.name[geoLang], geoLang),
        )
        .map((country) => country.code),
    ]),
  );
}

export function buildGeneratedData({
  countries,
  countryFlags,
  mapRegions,
  outlyingTerritories,
}: BuildGeneratedDataParams): readonly GeneratedJsonFile[] {
  const countrySummaries = countries.map(toCountrySummary);

  return [
    {
      data: countries,
      path: resolve(GENERATED_DIRECTORY, "countries.json"),
    },
    {
      data: countrySummaries,
      path: resolve(GENERATED_DIRECTORY, "country-summaries.json"),
    },
    {
      data: buildCountrySummaryCodesByName(countries),
      path: resolve(GENERATED_DIRECTORY, "country-summary-codes-by-name.json"),
    },
    {
      data: countryFlags,
      path: resolve(GENERATED_DIRECTORY, "flags.json"),
    },
    {
      data: mapRegions,
      path: resolve(GENERATED_DIRECTORY, "map-regions.json"),
    },
    {
      data: outlyingTerritories,
      path: resolve(GENERATED_DIRECTORY, "outlying-territories.json"),
    },
  ];
}
