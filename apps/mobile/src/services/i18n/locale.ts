import { getLocales } from "expo-localization";

export const SUPPORTED_LOCALES = ["de", "en", "es", "fr", "it", "pt"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return SUPPORTED_LOCALES.some(
    (supportedLocale) => supportedLocale === locale,
  );
}

export const DEFAULT_LOCALE = "en" as const;

export function resolveLocale(locale: unknown): SupportedLocale {
  if (isSupportedLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export function getDeviceLanguage() {
  const deviceLanguage = getLocales()[0].languageCode;
  if (isSupportedLocale(deviceLanguage)) {
    return deviceLanguage;
  }

  return DEFAULT_LOCALE;
}
