import mapRegionsData from "../generated/map-regions.json";
import type { MapRegion } from "./map-definition";

export * from "./map-definition";

export const MAP_REGIONS = mapRegionsData as readonly MapRegion[];
