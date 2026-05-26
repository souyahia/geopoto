import type { Country } from "../../src/countries.ts";
import {
  MAP_REGION_NAMES,
  type MapBounds,
  type MapRegion,
} from "../../src/map-definition.ts";
import type { OutlyingTerritory } from "../../src/outlying-territories.ts";
import { MAP_REGION_PADDING_RATIO } from "./config.ts";
import { formatNumber } from "./country-map.ts";

interface BuildMapRegionsParams {
  countries: readonly Country[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface GetCountryNavigationBoundsParams {
  country: Country;
}

function mergeMapBounds(bounds: readonly MapBounds[]): MapBounds {
  if (bounds.length === 0) {
    throw new Error("Cannot merge an empty map bounds list");
  }

  return {
    maxX: formatNumber(Math.max(...bounds.map(({ maxX }) => maxX))),
    maxY: formatNumber(Math.max(...bounds.map(({ maxY }) => maxY))),
    minX: formatNumber(Math.min(...bounds.map(({ minX }) => minX))),
    minY: formatNumber(Math.min(...bounds.map(({ minY }) => minY))),
  };
}

function addMapBoundsPadding(bounds: MapBounds): MapBounds {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const padding = Math.max(width, height) * MAP_REGION_PADDING_RATIO;

  return {
    maxX: formatNumber(bounds.maxX + padding),
    maxY: formatNumber(bounds.maxY + padding),
    minX: formatNumber(bounds.minX - padding),
    minY: formatNumber(bounds.minY - padding),
  };
}

function getCountryNavigationBounds({
  country,
}: GetCountryNavigationBoundsParams): readonly MapBounds[] {
  const { countryPressArea } = country;

  if (countryPressArea === undefined) {
    return [country.map.bounds];
  }

  return [country.map.bounds, countryPressArea.bounds];
}

export function buildMapRegions({
  countries,
  outlyingTerritories,
}: BuildMapRegionsParams): readonly MapRegion[] {
  return MAP_REGION_NAMES.map((name) => {
    const countryBounds = countries
      .filter((country) => country.regions.includes(name))
      .flatMap((country) => getCountryNavigationBounds({ country }));
    const outlyingTerritoryBounds = outlyingTerritories
      .filter((outlyingTerritory) => outlyingTerritory.regions.includes(name))
      .map((outlyingTerritory) => outlyingTerritory.map.bounds);
    const bounds = [...countryBounds, ...outlyingTerritoryBounds];

    return {
      bounds: addMapBoundsPadding(mergeMapBounds(bounds)),
      name,
    };
  });
}
