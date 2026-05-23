import {
  SUPPORTED_GEO_LANGUAGES,
  type LocalizedText,
} from "@geopoto/geo-data/geo-language";

export interface CountrySearchItem {
  capital: LocalizedText;
  code: string;
  continent: string;
  name: LocalizedText;
  regions: readonly string[];
}

interface FilterCountriesParams<TCountry extends CountrySearchItem> {
  countries: readonly TCountry[];
  searchQuery: string;
}

interface DoesCountryMatchSearchQueryParams {
  country: CountrySearchItem;
  normalizedQuery: string;
}

interface FindCountryByCodeParams<TCountry extends CountrySearchItem> {
  countries: readonly TCountry[];
  countryCode: string | undefined;
}

export function filterCountries<TCountry extends CountrySearchItem>({
  countries,
  searchQuery,
}: FilterCountriesParams<TCountry>): readonly TCountry[] {
  const normalizedQuery = normalizeSearchText(searchQuery);

  if (normalizedQuery.length === 0) {
    return countries;
  }

  return countries.filter((country) =>
    doesCountryMatchSearchQuery({ country, normalizedQuery }),
  );
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

function doesCountryMatchSearchQuery({
  country,
  normalizedQuery,
}: DoesCountryMatchSearchQueryParams) {
  return getCountrySearchValues(country).some((value) =>
    normalizeSearchText(value).includes(normalizedQuery),
  );
}

function getCountrySearchValues(country: CountrySearchItem) {
  return [
    country.code,
    country.continent,
    ...country.regions,
    ...SUPPORTED_GEO_LANGUAGES.flatMap((geoLang) => [
      country.name[geoLang],
      country.capital[geoLang],
    ]),
  ];
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
