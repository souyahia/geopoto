import type { TFunction } from "i18next";

import type { MapRegionName } from "@geopoto/geo-data";

interface GetRegionNameParams {
  region: MapRegionName;
  t: TFunction;
}

export function getRegionName({ region, t }: GetRegionNameParams) {
  return t(`geo.regions.${region}`);
}
