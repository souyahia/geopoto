import {
  SUPPORTED_GEO_LANGUAGES,
  type Country,
  type SupportedGeoLanguage,
} from "@geopoto/geo-data";

interface FilterCountriesParams {
  countries: readonly Country[];
  geoLang: SupportedGeoLanguage;
  searchQuery: string;
}

interface DoesCountryMatchSearchQueryParams {
  country: Country;
  normalizedQuery: string;
}

interface FindCountryByCodeParams {
  countries: readonly Country[];
  countryCode: string | undefined;
}

export function filterCountries({
  countries,
  geoLang,
  searchQuery,
}: FilterCountriesParams) {
  const normalizedQuery = normalizeSearchText(searchQuery);

  return countries
    .filter((country) => {
      if (normalizedQuery.length === 0) {
        return true;
      }

      return doesCountryMatchSearchQuery({ country, normalizedQuery });
    })
    .slice()
    .sort((firstCountry, secondCountry) =>
      firstCountry.name[geoLang].localeCompare(
        secondCountry.name[geoLang],
        geoLang,
      ),
    );
}

export function findCountryByCode({
  countries,
  countryCode,
}: FindCountryByCodeParams) {
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

function getCountrySearchValues(country: Country) {
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
