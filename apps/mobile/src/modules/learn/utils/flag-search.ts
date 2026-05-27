import type { CountryFlagColor } from "@geopoto/geo-data/flag-colors";

import { filterSearchItems } from "./learn-search";

export interface FlagSearchItem {
  colors: readonly CountryFlagColor[];
  countryName: string;
}

interface FilterFlagsParams<TFlag extends FlagSearchItem> {
  flags: readonly TFlag[];
  searchQuery: string;
  selectedColors: readonly CountryFlagColor[];
}

interface HasSelectedFlagColorsParams {
  flag: FlagSearchItem;
  selectedColors: readonly CountryFlagColor[];
}

export function filterFlags<TFlag extends FlagSearchItem>({
  flags,
  searchQuery,
  selectedColors,
}: FilterFlagsParams<TFlag>): readonly TFlag[] {
  const searchFilteredFlags = filterSearchItems({
    getSearchValues: getFlagSearchValues,
    items: flags,
    searchQuery,
  });

  if (selectedColors.length === 0) {
    return searchFilteredFlags;
  }

  return searchFilteredFlags.filter((flag) =>
    hasSelectedFlagColors({ flag, selectedColors }),
  );
}

function hasSelectedFlagColors({
  flag,
  selectedColors,
}: HasSelectedFlagColorsParams) {
  return selectedColors.every((color) => flag.colors.includes(color));
}

function getFlagSearchValues(flag: FlagSearchItem) {
  return [flag.countryName];
}
