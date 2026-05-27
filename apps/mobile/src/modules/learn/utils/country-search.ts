import type {
  LocalizedText,
  SupportedGeoLanguage,
} from "@geopoto/geo-data/geo-language";

import { filterSearchItems, normalizeSearchText } from "./learn-search";

export interface CountrySearchItem {
  code: string;
  name: LocalizedText;
}

interface FilterCountriesParams<TCountry extends CountrySearchItem> {
  countries: readonly TCountry[];
  geoLang: SupportedGeoLanguage;
  searchQuery: string;
}

interface FindCountryByCodeParams<TCountry extends CountrySearchItem> {
  countries: readonly TCountry[];
  countryCode: string | undefined;
}

interface GetCountrySearchValuesParams {
  country: CountrySearchItem;
  geoLang: SupportedGeoLanguage;
}

export function filterCountries<TCountry extends CountrySearchItem>({
  countries,
  geoLang,
  searchQuery,
}: FilterCountriesParams<TCountry>): readonly TCountry[] {
  return filterSearchItems({
    getSearchValues: (country) => getCountrySearchValues({ country, geoLang }),
    items: countries,
    searchQuery,
  });
}

export function findCountryByCode<TCountry extends CountrySearchItem>({
  countries,
  countryCode,
}: FindCountryByCodeParams<TCountry>): TCountry | null {
  if (countryCode === undefined) {
    return null;
  }

  const normalizedCountryCode = normalizeSearchText(countryCode);

  return (
    countries.find(
      (country) => normalizeSearchText(country.code) === normalizedCountryCode,
    ) ?? null
  );
}

function getCountrySearchValues({
  country,
  geoLang,
}: GetCountrySearchValuesParams) {
  return [country.name[geoLang]];
}
