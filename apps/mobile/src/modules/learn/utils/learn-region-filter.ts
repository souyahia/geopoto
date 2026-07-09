import { useCallback } from "react";
import { createMMKV, useMMKVString } from "react-native-mmkv";

import { isMapRegionName, type MapRegionName } from "@geopoto/geo-data";
import type { CountrySummary } from "@geopoto/geo-data/country-summaries";

const learnRegionFilterStorage = createMMKV({
  id: "learn-region-filter-storage",
});
const LEARN_REGION_FILTER_STORAGE_KEY = "selected-region";
const DEFAULT_LEARN_REGION: MapRegionName = "world";

export function useLearnRegionFilter() {
  const [storedRegion, setStoredRegion] = useMMKVString(
    LEARN_REGION_FILTER_STORAGE_KEY,
    learnRegionFilterStorage,
  );
  const selectedRegion = isMapRegionName(storedRegion)
    ? storedRegion
    : DEFAULT_LEARN_REGION;

  const setSelectedRegion = useCallback(
    (region: MapRegionName) => {
      setStoredRegion(region);
    },
    [setStoredRegion],
  );

  return {
    selectedRegion,
    setSelectedRegion,
  };
}

interface FilterCountrySummariesByRegionParams {
  countries: readonly CountrySummary[];
  region: MapRegionName;
}

export function filterCountrySummariesByRegion({
  countries,
  region,
}: FilterCountrySummariesByRegionParams): readonly CountrySummary[] {
  if (region === "world") {
    return countries;
  }

  return countries.filter((country) => country.regions.includes(region));
}
