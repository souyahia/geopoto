import type { SupportedLocale } from "@/services/i18n/locale";

const LANGUAGE_COUNTRY_CODES: Record<SupportedLocale, string> = {
  de: "DE",
  en: "GB",
  es: "ES",
  fr: "FR",
  it: "IT",
  pt: "PT",
};

export function getLanguageCountryCode(locale: SupportedLocale) {
  return LANGUAGE_COUNTRY_CODES[locale];
}
