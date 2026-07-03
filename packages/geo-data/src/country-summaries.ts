import countrySummariesData from "../generated/country-summaries.json";
import countrySummaryCodesByNameData from "../generated/country-summary-codes-by-name.json";
import { isCountryDisabled, type Continent } from "./countries";
import { type LocalizedText, type SupportedGeoLanguage } from "./geo-language";
import type { MapRegionName } from "./map-definition";

export interface CountrySummary {
  capital: LocalizedText;
  code: string;
  continent: Continent;
  name: LocalizedText;
  regions: readonly MapRegionName[];
}

const COUNTRY_SUMMARIES_DATA =
  countrySummariesData as readonly CountrySummary[];
const COUNTRY_SUMMARY_CODES_BY_NAME_DATA =
  countrySummaryCodesByNameData as Readonly<
    Record<SupportedGeoLanguage, readonly string[]>
  >;

const COUNTRY_SUMMARIES_BY_CODE = new Map(
  COUNTRY_SUMMARIES_DATA.map((country) => [country.code, country]),
);

function getCountrySummaryByCode(code: string) {
  const country = COUNTRY_SUMMARIES_BY_CODE.get(code);

  if (country === undefined) {
    throw new Error(`Missing country summary for ${code}`);
  }

  return country;
}

function toCountrySummariesByCode(codes: readonly string[]) {
  return codes
    .filter((code) => !isCountryDisabled(code))
    .map(getCountrySummaryByCode);
}

export const COUNTRY_SUMMARIES: readonly CountrySummary[] =
  COUNTRY_SUMMARIES_DATA.filter((country) => !isCountryDisabled(country.code));

export const COUNTRY_SUMMARIES_BY_NAME: Readonly<
  Record<SupportedGeoLanguage, readonly CountrySummary[]>
> = {
  de: toCountrySummariesByCode(COUNTRY_SUMMARY_CODES_BY_NAME_DATA.de),
  en: toCountrySummariesByCode(COUNTRY_SUMMARY_CODES_BY_NAME_DATA.en),
  es: toCountrySummariesByCode(COUNTRY_SUMMARY_CODES_BY_NAME_DATA.es),
  fr: toCountrySummariesByCode(COUNTRY_SUMMARY_CODES_BY_NAME_DATA.fr),
  it: toCountrySummariesByCode(COUNTRY_SUMMARY_CODES_BY_NAME_DATA.it),
  pt: toCountrySummariesByCode(COUNTRY_SUMMARY_CODES_BY_NAME_DATA.pt),
};
