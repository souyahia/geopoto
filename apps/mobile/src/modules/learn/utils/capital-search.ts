import { filterSearchItems } from "./learn-search";

export interface CapitalSearchItem {
  capitalName: string;
  countryName: string;
}

interface FilterCapitalsParams<TCapital extends CapitalSearchItem> {
  capitals: readonly TCapital[];
  searchQuery: string;
}

export function filterCapitals<TCapital extends CapitalSearchItem>({
  capitals,
  searchQuery,
}: FilterCapitalsParams<TCapital>): readonly TCapital[] {
  return filterSearchItems({
    getSearchValues: getCapitalSearchValues,
    items: capitals,
    searchQuery,
  });
}

function getCapitalSearchValues(capital: CapitalSearchItem) {
  return [capital.capitalName, capital.countryName];
}
