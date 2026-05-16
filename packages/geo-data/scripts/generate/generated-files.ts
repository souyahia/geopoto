import { resolve } from "node:path";

import type { Country } from "../../src/countries.ts";
import type { MapRegion } from "../../src/map-definition.ts";
import { GENERATED_DIRECTORY } from "./config.ts";
import type { GeneratedJsonFile } from "./types.ts";

interface BuildGeneratedDataParams {
  countries: readonly Country[];
  countryFlags: Readonly<Record<string, unknown>>;
  mapRegions: readonly MapRegion[];
}

export function buildGeneratedData({
  countries,
  countryFlags,
  mapRegions,
}: BuildGeneratedDataParams): readonly GeneratedJsonFile[] {
  return [
    {
      data: countries,
      path: resolve(GENERATED_DIRECTORY, "countries.json"),
    },
    {
      data: countryFlags,
      path: resolve(GENERATED_DIRECTORY, "flags.json"),
    },
    {
      data: mapRegions,
      path: resolve(GENERATED_DIRECTORY, "map-regions.json"),
    },
  ];
}
