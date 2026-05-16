import type { GeoPath, GeoProjection } from "d3-geo";

import type { CountryMap, MapBounds } from "../../src/map-definition.ts";
import type { RestCountry } from "./rest-countries.ts";
import type { CountryFeature } from "./types.ts";

interface BuildCountryMapParams {
  feature: CountryFeature | null;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountry: RestCountry;
}

interface SyntheticMapParams {
  projection: GeoProjection;
  restCountry: RestCountry;
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

function createSyntheticMap({
  projection,
  restCountry,
}: SyntheticMapParams): CountryMap {
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
  feature,
  pathGenerator,
  projection,
  restCountry,
}: BuildCountryMapParams): CountryMap {
  if (feature === null) {
    return createSyntheticMap({ projection, restCountry });
  }

  const path = pathGenerator(feature);

  if (path === null) {
    return createSyntheticMap({ projection, restCountry });
  }

  return {
    bounds: toMapBounds(pathGenerator.bounds(feature)),
    path,
  };
}
