import type { SkPath } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import {
  COUNTRIES,
  OUTLYING_TERRITORIES,
  type Country,
  type CountryMapPathResolution,
  type OutlyingTerritory,
} from "@geopoto/geo-data";

type MapEntity = Country | OutlyingTerritory;

interface GetMapEntityPathParams {
  entity: MapEntity;
  pathResolution: CountryMapPathResolution;
}

interface GetAggregatedMapEntityPathParams {
  entities: readonly MapEntity[];
  pathResolution: CountryMapPathResolution;
}

interface GetWorldMapPathParams {
  pathResolution: CountryMapPathResolution;
}

interface GetCountryPressAreaPathParams {
  country: Country;
}

const mapEntityPaths = new Map<string, SkPath | null>();
const aggregatedMapEntityPaths = new Map<string, SkPath | null>();
const worldMapPaths = new Map<CountryMapPathResolution, SkPath | null>();
const countryPressAreaPaths = new Map<string, SkPath | null>();
const WORLD_MAP_ENTITIES: readonly MapEntity[] = [
  ...COUNTRIES,
  ...OUTLYING_TERRITORIES,
];

function getMapEntityPath({
  entity,
  pathResolution,
}: GetMapEntityPathParams): SkPath | null {
  const cacheKey = getMapEntityPathCacheKey({
    entity,
    pathResolution,
  });
  const hasCachedPath = mapEntityPaths.has(cacheKey);

  if (hasCachedPath) {
    return mapEntityPaths.get(cacheKey) ?? null;
  }

  const path = Skia.Path.MakeFromSVGString(entity.map.paths[pathResolution]);
  mapEntityPaths.set(cacheKey, path);

  return path;
}

export function getWorldMapPath({
  pathResolution,
}: GetWorldMapPathParams): SkPath | null {
  const hasCachedPath = worldMapPaths.has(pathResolution);

  if (hasCachedPath) {
    return worldMapPaths.get(pathResolution) ?? null;
  }

  const path = getAggregatedMapEntityPath({
    entities: WORLD_MAP_ENTITIES,
    pathResolution,
  });
  worldMapPaths.set(pathResolution, path);

  return path;
}

export function getAggregatedMapEntityPath({
  entities,
  pathResolution,
}: GetAggregatedMapEntityPathParams): SkPath | null {
  const cacheKey = getAggregatedMapEntityPathCacheKey({
    entities,
    pathResolution,
  });
  const hasCachedPath = aggregatedMapEntityPaths.has(cacheKey);

  if (hasCachedPath) {
    return aggregatedMapEntityPaths.get(cacheKey) ?? null;
  }

  const builder = Skia.PathBuilder.Make();
  let hasPath = false;

  for (const entity of entities) {
    const path = getMapEntityPath({
      entity,
      pathResolution,
    });

    if (path === null) {
      continue;
    }

    builder.addPath(path);
    hasPath = true;
  }

  if (!hasPath) {
    aggregatedMapEntityPaths.set(cacheKey, null);
    return null;
  }

  const path = builder.detach();
  aggregatedMapEntityPaths.set(cacheKey, path);

  return path;
}

export function getCountryPressAreaPath({
  country,
}: GetCountryPressAreaPathParams): SkPath | null {
  const hasCachedPath = countryPressAreaPaths.has(country.code);

  if (hasCachedPath) {
    return countryPressAreaPaths.get(country.code) ?? null;
  }

  if (country.countryPressArea === undefined) {
    countryPressAreaPaths.set(country.code, null);
    return null;
  }

  const path = Skia.Path.MakeFromSVGString(country.countryPressArea.path);
  countryPressAreaPaths.set(country.code, path);

  return path;
}

function getMapEntityPathCacheKey({
  entity,
  pathResolution,
}: GetMapEntityPathParams): string {
  return `${pathResolution}:${entity.code}`;
}

function getAggregatedMapEntityPathCacheKey({
  entities,
  pathResolution,
}: GetAggregatedMapEntityPathParams): string {
  return `${pathResolution}:${entities.map((entity) => entity.code).join(":")}`;
}
