import type { SupportedGeoLanguage } from "../../src/geo-language.ts";

/**
 * Developer-authored overrides for the canonical localized country name.
 *
 * RestCountries is the default source for display names, but some of its
 * translations are outdated or non-idiomatic. An entry here replaces the
 * RestCountries value for the given language only; every other language keeps
 * the generated value.
 *
 * When overriding a name, remember that the old name usually stays a valid
 * answer, so add it to `COUNTRY_ALIASES_CONFIGS` in `country-aliases-config.ts`.
 */
export const COUNTRY_NAME_OVERRIDES: Readonly<
  Record<string, Partial<Record<SupportedGeoLanguage, string>>>
> = {
  // Prefer the more common French spelling "Suriname" over RestCountries'
  // "Surinam" (the "Surinam" form stays accepted via the aliases config).
  SR: {
    fr: "Suriname",
  },
  // Eswatini was renamed from Swaziland in 2018, but RestCountries still returns
  // the old "Swaziland"-derived name in every language.
  SZ: {
    de: "Eswatini",
    es: "Eswatini",
    fr: "Eswatini",
    it: "Eswatini",
    pt: "Eswatini",
  },
};

interface GetCountryNameOverrideParams {
  countryCode: string;
  language: SupportedGeoLanguage;
}

export function getCountryNameOverride({
  countryCode,
  language,
}: GetCountryNameOverrideParams): string | undefined {
  return COUNTRY_NAME_OVERRIDES[countryCode]?.[language];
}
