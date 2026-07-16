import type { Country } from "../../src/countries.ts";
import {
  MAP_REGION_NAMES,
  type MapBounds,
  type MapRegion,
  type MapRegionName,
} from "../../src/map-definition.ts";
import type { OutlyingTerritory } from "../../src/outlying-territories.ts";
import {
  MAP_REGION_BOUNDS_ANCHORS,
  MAP_REGION_PADDING_RATIO,
  type MapRegionBoundsAnchors,
  type MapRegionEdgeAnchor,
} from "./config.ts";
import { formatNumber } from "./country-map.ts";

const WORLD_REGION_NAME: MapRegionName = "world";

type MapBoundsEdge = keyof MapBounds;

interface BuildMapRegionsParams {
  countries: readonly Country[];
  latitudeToY: (latitude: number) => number;
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface GetCountryNavigationBoundsParams {
  country: Country;
}

interface ResolveEdgeAnchorParams {
  anchor: MapRegionEdgeAnchor;
  boundsByCode: ReadonlyMap<string, MapBounds>;
  edge: MapBoundsEdge;
  latitudeToY: (latitude: number) => number;
}

interface ApplyBoundsAnchorsParams {
  anchors: MapRegionBoundsAnchors;
  bounds: MapBounds;
  boundsByCode: ReadonlyMap<string, MapBounds>;
  latitudeToY: (latitude: number) => number;
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

function resolveAnchorBounds(
  code: string,
  boundsByCode: ReadonlyMap<string, MapBounds>,
): MapBounds {
  const bounds = boundsByCode.get(code);

  if (bounds === undefined) {
    throw new Error(
      `Map region bounds anchor references unknown entity code "${code}".`,
    );
  }

  return bounds;
}

function resolveEdgeAnchor({
  anchor,
  boundsByCode,
  edge,
  latitudeToY,
}: ResolveEdgeAnchorParams): number {
  if ("countryCode" in anchor) {
    return resolveAnchorBounds(anchor.countryCode, boundsByCode)[edge];
  }

  if (edge !== "minY" && edge !== "maxY") {
    throw new Error(
      `Map region bounds anchor uses a latitude for the "${edge}" edge, but latitude only applies to the minY/maxY edges.`,
    );
  }

  return formatNumber(latitudeToY(anchor.latitude));
}

function applyBoundsAnchors({
  anchors,
  bounds,
  boundsByCode,
  latitudeToY,
}: ApplyBoundsAnchorsParams): MapBounds {
  return {
    maxX:
      anchors.maxX === undefined
        ? bounds.maxX
        : resolveEdgeAnchor({
            anchor: anchors.maxX,
            boundsByCode,
            edge: "maxX",
            latitudeToY,
          }),
    maxY:
      anchors.maxY === undefined
        ? bounds.maxY
        : resolveEdgeAnchor({
            anchor: anchors.maxY,
            boundsByCode,
            edge: "maxY",
            latitudeToY,
          }),
    minX:
      anchors.minX === undefined
        ? bounds.minX
        : resolveEdgeAnchor({
            anchor: anchors.minX,
            boundsByCode,
            edge: "minX",
            latitudeToY,
          }),
    minY:
      anchors.minY === undefined
        ? bounds.minY
        : resolveEdgeAnchor({
            anchor: anchors.minY,
            boundsByCode,
            edge: "minY",
            latitudeToY,
          }),
  };
}

function buildBoundsByCode(
  countries: readonly Country[],
): ReadonlyMap<string, MapBounds> {
  const boundsByCode = new Map<string, MapBounds>();

  for (const country of countries) {
    boundsByCode.set(country.code, country.map.bounds);
  }

  return boundsByCode;
}

export function buildMapRegions({
  countries,
  latitudeToY,
  outlyingTerritories,
}: BuildMapRegionsParams): readonly MapRegion[] {
  // Region anchors only ever reference countries, since outlying territories are
  // non-interactive display geometry and never frame a continent.
  const boundsByCode = buildBoundsByCode(countries);

  return MAP_REGION_NAMES.map((name) => {
    const countryBounds = countries
      .filter((country) => country.regions.includes(name))
      .flatMap((country) => getCountryNavigationBounds({ country }));
    // Continents are framed by their member countries only. The world region is
    // the exception: its bounds also drive the pannable/clamping area, so they
    // must still enclose every rendered outlying territory.
    const outlyingTerritoryBounds =
      name === WORLD_REGION_NAME
        ? outlyingTerritories
            .filter((outlyingTerritory) =>
              outlyingTerritory.regions.includes(name),
            )
            .map((outlyingTerritory) => outlyingTerritory.map.bounds)
        : [];
    const memberBounds = mergeMapBounds([
      ...countryBounds,
      ...outlyingTerritoryBounds,
    ]);
    const anchors = MAP_REGION_BOUNDS_ANCHORS[name];
    const framedBounds =
      anchors === undefined
        ? memberBounds
        : applyBoundsAnchors({
            anchors,
            bounds: memberBounds,
            boundsByCode,
            latitudeToY,
          });

    return {
      bounds: addMapBoundsPadding(framedBounds),
      name,
    };
  });
}
