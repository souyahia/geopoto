export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface CountryMapPaths {
  highResolution: string;
  lowResolution: string;
}

export type CountryMapPathResolution = keyof CountryMapPaths;

export interface CountryMap {
  bounds: MapBounds;
  paths: CountryMapPaths;
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
