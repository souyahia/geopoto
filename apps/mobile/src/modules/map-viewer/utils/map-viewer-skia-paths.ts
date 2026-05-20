import type { SkPath } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import {
  COUNTRIES,
  type Country,
  type CountryMapPathResolution,
} from "@geopoto/geo-data";

interface GetCountryMapPathParams {
  country: Country;
  pathResolution: CountryMapPathResolution;
}

interface GetAggregatedCountryMapPathParams {
  countries: readonly Country[];
  pathResolution: CountryMapPathResolution;
}

interface GetWorldMapPathParams {
  pathResolution: CountryMapPathResolution;
}

const countryMapPaths = new Map<string, SkPath | null>();
const aggregatedCountryMapPaths = new Map<string, SkPath | null>();
const worldMapPaths = new Map<CountryMapPathResolution, SkPath | null>();

export function getCountryMapPath({
  country,
  pathResolution,
}: GetCountryMapPathParams): SkPath | null {
  const cacheKey = getCountryMapPathCacheKey({
    country,
    pathResolution,
  });
  const hasCachedPath = countryMapPaths.has(cacheKey);

  if (hasCachedPath) {
    return countryMapPaths.get(cacheKey) ?? null;
  }

  const path = Skia.Path.MakeFromSVGString(country.map.paths[pathResolution]);
  countryMapPaths.set(cacheKey, path);

  return path;
}

export function getWorldMapPath({
  pathResolution,
}: GetWorldMapPathParams): SkPath | null {
  const hasCachedPath = worldMapPaths.has(pathResolution);

  if (hasCachedPath) {
    return worldMapPaths.get(pathResolution) ?? null;
  }

  const path = getAggregatedCountryMapPath({
    countries: COUNTRIES,
    pathResolution,
  });
  worldMapPaths.set(pathResolution, path);

  return path;
}

export function getAggregatedCountryMapPath({
  countries,
  pathResolution,
}: GetAggregatedCountryMapPathParams): SkPath | null {
  const cacheKey = getAggregatedCountryMapPathCacheKey({
    countries,
    pathResolution,
  });
  const hasCachedPath = aggregatedCountryMapPaths.has(cacheKey);

  if (hasCachedPath) {
    return aggregatedCountryMapPaths.get(cacheKey) ?? null;
  }

  const builder = Skia.PathBuilder.Make();
  let hasPath = false;

  for (const country of countries) {
    const path = getCountryMapPath({
      country,
      pathResolution,
    });

    if (path === null) {
      continue;
    }

    builder.addPath(path);
    hasPath = true;
  }

  if (!hasPath) {
    aggregatedCountryMapPaths.set(cacheKey, null);
    return null;
  }

  const path = builder.detach();
  aggregatedCountryMapPaths.set(cacheKey, path);

  return path;
}

function getCountryMapPathCacheKey({
  country,
  pathResolution,
}: GetCountryMapPathParams): string {
  return `${pathResolution}:${country.code}`;
}

function getAggregatedCountryMapPathCacheKey({
  countries,
  pathResolution,
}: GetAggregatedCountryMapPathParams): string {
  return `${pathResolution}:${countries.map((country) => country.code).join(":")}`;
}
