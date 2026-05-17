import type { TFunction } from "i18next";

import type { Continent } from "@geopoto/geo-data";

interface GetContinentNameParams {
  continent: Continent;
  t: TFunction;
}

export function getContinentName({ continent, t }: GetContinentNameParams) {
  return t(`geo.continents.${continent}`);
}
