interface FilterSearchItemsParams<TItem> {
  getSearchValues: (item: TItem) => readonly string[];
  items: readonly TItem[];
  searchQuery: string;
}

interface IsSearchItemMatchingQueryParams<TItem> {
  getSearchValues: (item: TItem) => readonly string[];
  item: TItem;
  normalizedQuery: string;
}

export function filterSearchItems<TItem>({
  getSearchValues,
  items,
  searchQuery,
}: FilterSearchItemsParams<TItem>): readonly TItem[] {
  const normalizedQuery = normalizeSearchText(searchQuery);

  if (normalizedQuery.length === 0) {
    return items;
  }

  return items.filter((item) =>
    isSearchItemMatchingQuery({ getSearchValues, item, normalizedQuery }),
  );
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isSearchItemMatchingQuery<TItem>({
  getSearchValues,
  item,
  normalizedQuery,
}: IsSearchItemMatchingQueryParams<TItem>) {
  return getSearchValues(item).some((value) =>
    normalizeSearchText(value).includes(normalizedQuery),
  );
}
