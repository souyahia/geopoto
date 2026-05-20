import type { GeoPath, GeoProjection } from "d3-geo";

import type { CountryMap, MapBounds } from "../../src/map-definition.ts";
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
  projection: GeoProjection;
  pathGenerator: GeoPath;
  restCountry: RestCountry;
}

interface SyntheticMapPathParams {
  projection: GeoProjection;
  restCountry: RestCountry;
}

interface BuiltCountryMapPath {
  bounds: MapBounds;
  path: string;
}

const SYNTHETIC_MAP_POINT_RADIUS = 1.5;

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
    pathGenerator,
    projection,
    restCountry,
  });
  const lowResolutionMapPath = buildCountryMapPath({
    fallbackMapPath: highResolutionMapPath,
    feature: lowResolutionFeature,
    pathGenerator,
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
  pathGenerator,
  projection,
  restCountry,
}: BuildCountryMapPathParams): BuiltCountryMapPath {
  if (feature === null) {
    if (fallbackMapPath !== null) {
      return fallbackMapPath;
    }

    return createSyntheticMapPath({ projection, restCountry });
  }

  const path = pathGenerator(feature);

  if (path === null) {
    if (fallbackMapPath !== null) {
      return fallbackMapPath;
    }

    return createSyntheticMapPath({ projection, restCountry });
  }

  return {
    bounds: toMapBounds(pathGenerator.bounds(feature)),
    path,
  };
}
