import mapRegionsData from "../generated/map-regions.json";

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface CountryMap {
  bounds: MapBounds;
  path: string;
}

export const MAP_REGION_NAMES = [
  "world",
  "africa",
  "south-america",
  "north-america",
  "asia",
  "europe",
  "oceania",
  "caribbean",
] as const;

export type MapRegionName = (typeof MAP_REGION_NAMES)[number];

export function isMapRegionName(value: unknown): value is MapRegionName {
  return MAP_REGION_NAMES.includes(value as MapRegionName);
}

export interface MapRegion {
  name: MapRegionName;
  bounds: MapBounds;
}

export const mapRegions: readonly MapRegion[] = mapRegionsData;
