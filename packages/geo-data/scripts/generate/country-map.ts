import type { GeoPath, GeoProjection } from "d3-geo";

import type {
  CountryMap,
  CountryMapPathResolution,
  MapBounds,
} from "../../src/map-definition.ts";
import type { RestCountry } from "./rest-countries.ts";
import type { CountryFeature } from "./types.ts";

interface BuildCountryMapParams {
  highResolutionFeature: CountryFeature | null;
  lowResolutionFeature: CountryFeature | null;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountry: RestCountry;
}

interface BuildCountryMapPathParams {
  fallbackMapPath: BuiltCountryMapPath | null;
  feature: CountryFeature | null;
  isSourceGeometryRequired: boolean;
  projection: GeoProjection;
  pathGenerator: GeoPath;
  pathResolution: CountryMapPathResolution;
  restCountry: RestCountry;
}

interface SyntheticMapPathParams {
  projection: GeoProjection;
  restCountry: RestCountry;
}

interface WorldMapMetrics {
  centerX: number;
  width: number;
}

interface GetWorldMapMetricsParams {
  projection: GeoProjection;
}

interface ApplyAntimeridianDisplayWrapParams {
  mapPath: BuiltCountryMapPath;
  projection: GeoProjection;
  restCountry: RestCountry;
}

interface GetMapPathBoundsParams {
  path: string;
}

interface TranslateMapPathXParams {
  path: string;
  xOffset: number;
}

interface ShouldWrapSubpathToRightParams {
  bounds: MapBounds;
  worldMapMetrics: WorldMapMetrics;
}

interface CreateMissingSourceGeometryErrorParams {
  pathResolution: CountryMapPathResolution;
  restCountry: RestCountry;
}

interface BuiltCountryMapPath {
  bounds: MapBounds;
  path: string;
}

const SYNTHETIC_MAP_POINT_RADIUS = 1.5;
const SYNTHETIC_COUNTRY_MAP_CODES = new Set<string>(["TV"]);
export const ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODES = [
  "FJ",
  "KI",
  "NZ",
  "RU",
] as const;
const ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODE_SET = new Set<string>(
  ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODES,
);
const SVG_COORDINATE_PAIR_PATTERN = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g;
const SVG_SUBPATH_PATTERN = /M[^M]*/g;
const WORLD_LEFT_LONGITUDE = -180;
const WORLD_RIGHT_LONGITUDE = 180;
const WORLD_METRICS_LATITUDE = 0;

export function formatNumber(value: number): number {
  return Number(value.toFixed(3));
}

export function toMapBounds(
  bounds: readonly [readonly [number, number], readonly [number, number]],
): MapBounds {
  const [[minX, minY], [maxX, maxY]] = bounds;

  return {
    maxX: formatNumber(maxX),
    maxY: formatNumber(maxY),
    minX: formatNumber(minX),
    minY: formatNumber(minY),
  };
}

function createSyntheticMapPath({
  projection,
  restCountry,
}: SyntheticMapPathParams): BuiltCountryMapPath {
  if (restCountry.latlng === null) {
    throw new Error(`Missing map geometry and latlng for ${restCountry.cca2}`);
  }

  const [latitude, longitude] = restCountry.latlng;
  const projectedPoint = projection([longitude, latitude]);

  if (projectedPoint === null) {
    throw new Error(`Unable to project fallback point for ${restCountry.cca2}`);
  }

  const [x, y] = projectedPoint;
  const formattedRadius = formatNumber(SYNTHETIC_MAP_POINT_RADIUS);
  const formattedDiameter = formatNumber(SYNTHETIC_MAP_POINT_RADIUS * 2);
  const path = [
    `M${formatNumber(x - SYNTHETIC_MAP_POINT_RADIUS)},${formatNumber(y)}`,
    `a${formattedRadius},${formattedRadius} 0 1,0 ${formattedDiameter},0`,
    `a${formattedRadius},${formattedRadius} 0 1,0 -${formattedDiameter},0`,
  ].join("");

  return {
    bounds: {
      maxX: formatNumber(x + SYNTHETIC_MAP_POINT_RADIUS),
      maxY: formatNumber(y + SYNTHETIC_MAP_POINT_RADIUS),
      minX: formatNumber(x - SYNTHETIC_MAP_POINT_RADIUS),
      minY: formatNumber(y - SYNTHETIC_MAP_POINT_RADIUS),
    },
    path,
  };
}

function shouldUseSyntheticCountryMap(restCountry: RestCountry): boolean {
  return SYNTHETIC_COUNTRY_MAP_CODES.has(restCountry.cca2);
}

function getWorldMapMetrics({
  projection,
}: GetWorldMapMetricsParams): WorldMapMetrics {
  const leftPoint = projection([WORLD_LEFT_LONGITUDE, WORLD_METRICS_LATITUDE]);
  const rightPoint = projection([
    WORLD_RIGHT_LONGITUDE,
    WORLD_METRICS_LATITUDE,
  ]);

  if (leftPoint === null || rightPoint === null) {
    throw new Error("Unable to project world bounds for map wrapping.");
  }

  const minX = Math.min(leftPoint[0], rightPoint[0]);
  const maxX = Math.max(leftPoint[0], rightPoint[0]);
  const width = maxX - minX;

  return {
    centerX: minX + width / 2,
    width,
  };
}

function getMapPathBounds({
  path,
}: GetMapPathBoundsParams): MapBounds | null {
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let hasPoint = false;

  for (const match of path.matchAll(SVG_COORDINATE_PAIR_PATTERN)) {
    const [, xValue, yValue] = match;

    if (xValue === undefined || yValue === undefined) {
      continue;
    }

    const x = Number(xValue);
    const y = Number(yValue);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }

    hasPoint = true;
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
  }

  if (!hasPoint) {
    return null;
  }

  return {
    maxX: formatNumber(maxX),
    maxY: formatNumber(maxY),
    minX: formatNumber(minX),
    minY: formatNumber(minY),
  };
}

function translateMapPathX({
  path,
  xOffset,
}: TranslateMapPathXParams): string {
  return path.replace(
    SVG_COORDINATE_PAIR_PATTERN,
    (_match, xValue: string, yValue: string) =>
      `${formatNumber(Number(xValue) + xOffset)},${yValue}`,
  );
}

function shouldWrapSubpathToRight({
  bounds,
  worldMapMetrics,
}: ShouldWrapSubpathToRightParams): boolean {
  const centerX = (bounds.minX + bounds.maxX) / 2;

  return centerX < worldMapMetrics.centerX;
}

function applyAntimeridianDisplayWrap({
  mapPath,
  projection,
  restCountry,
}: ApplyAntimeridianDisplayWrapParams): BuiltCountryMapPath {
  if (!ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODE_SET.has(restCountry.cca2)) {
    return mapPath;
  }

  const worldMapMetrics = getWorldMapMetrics({ projection });
  const subpaths = mapPath.path.match(SVG_SUBPATH_PATTERN);

  if (subpaths === null) {
    return mapPath;
  }

  let hasWrappedSubpath = false;
  const wrappedPath = subpaths
    .map((subpath) => {
      const bounds = getMapPathBounds({ path: subpath });

      if (bounds === null) {
        return subpath;
      }

      if (!shouldWrapSubpathToRight({ bounds, worldMapMetrics })) {
        return subpath;
      }

      hasWrappedSubpath = true;

      return translateMapPathX({
        path: subpath,
        xOffset: worldMapMetrics.width,
      });
    })
    .join("");

  if (!hasWrappedSubpath) {
    return mapPath;
  }

  return {
    bounds: getMapPathBounds({ path: wrappedPath }) ?? mapPath.bounds,
    path: wrappedPath,
  };
}

function createMissingSourceGeometryError({
  pathResolution,
  restCountry,
}: CreateMissingSourceGeometryErrorParams): Error {
  return new Error(
    `Missing required ${pathResolution} source geometry for ${restCountry.cca2} (${restCountry.name.common}). Add a source geometry match or mark the country as synthetic.`,
  );
}

export function buildCountryMap({
  highResolutionFeature,
  lowResolutionFeature,
  pathGenerator,
  projection,
  restCountry,
}: BuildCountryMapParams): CountryMap {
  const highResolutionMapPath = buildCountryMapPath({
    fallbackMapPath: null,
    feature: highResolutionFeature,
    isSourceGeometryRequired: !shouldUseSyntheticCountryMap(restCountry),
    pathGenerator,
    pathResolution: "highResolution",
    projection,
    restCountry,
  });
  const lowResolutionMapPath = buildCountryMapPath({
    fallbackMapPath: highResolutionMapPath,
    feature: lowResolutionFeature,
    isSourceGeometryRequired: false,
    pathGenerator,
    pathResolution: "lowResolution",
    projection,
    restCountry,
  });

  return {
    bounds: highResolutionMapPath.bounds,
    paths: {
      highResolution: highResolutionMapPath.path,
      lowResolution: lowResolutionMapPath.path,
    },
  };
}

function buildCountryMapPath({
  fallbackMapPath,
  feature,
  isSourceGeometryRequired,
  pathGenerator,
  pathResolution,
  projection,
  restCountry,
}: BuildCountryMapPathParams): BuiltCountryMapPath {
  if (feature === null) {
    if (isSourceGeometryRequired) {
      throw createMissingSourceGeometryError({ pathResolution, restCountry });
    }

    if (fallbackMapPath !== null) {
      return fallbackMapPath;
    }

    return createSyntheticMapPath({ projection, restCountry });
  }

  const path = pathGenerator(feature);

  if (path === null) {
    if (isSourceGeometryRequired) {
      throw createMissingSourceGeometryError({ pathResolution, restCountry });
    }

    if (fallbackMapPath !== null) {
      return fallbackMapPath;
    }

    return createSyntheticMapPath({ projection, restCountry });
  }

  return applyAntimeridianDisplayWrap({
    mapPath: {
      bounds: toMapBounds(pathGenerator.bounds(feature)),
      path,
    },
    projection,
    restCountry,
  });
}
