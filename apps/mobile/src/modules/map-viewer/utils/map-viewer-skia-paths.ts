import type { SkPath } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import { COUNTRIES, type Country } from "@geopoto/geo-data";

interface GetCountryMapPathParams {
  country: Country;
}

interface GetAggregatedCountryMapPathParams {
  countries: readonly Country[];
}

const countryMapPaths = new Map<string, SkPath | null>();
const aggregatedCountryMapPaths = new Map<string, SkPath | null>();
let worldMapPath: SkPath | null | undefined;

export function getCountryMapPath({
  country,
}: GetCountryMapPathParams): SkPath | null {
  const hasCachedPath = countryMapPaths.has(country.code);

  if (hasCachedPath) {
    return countryMapPaths.get(country.code) ?? null;
  }

  const path = Skia.Path.MakeFromSVGString(country.map.paths.lowResolution);
  countryMapPaths.set(country.code, path);

  return path;
}

export function getWorldMapPath(): SkPath | null {
  if (worldMapPath !== undefined) {
    return worldMapPath;
  }

  worldMapPath = getAggregatedCountryMapPath({ countries: COUNTRIES });

  return worldMapPath;
}

export function getAggregatedCountryMapPath({
  countries,
}: GetAggregatedCountryMapPathParams): SkPath | null {
  const cacheKey = getAggregatedCountryMapPathCacheKey({ countries });
  const hasCachedPath = aggregatedCountryMapPaths.has(cacheKey);

  if (hasCachedPath) {
    return aggregatedCountryMapPaths.get(cacheKey) ?? null;
  }

  const builder = Skia.PathBuilder.Make();
  let hasPath = false;

  for (const country of countries) {
    const path = getCountryMapPath({ country });

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

function getAggregatedCountryMapPathCacheKey({
  countries,
}: GetAggregatedCountryMapPathParams): string {
  return countries.map((country) => country.code).join(":");
}
