export const SUPPORTED_GEO_LANGUAGES = [
  "de",
  "en",
  "es",
  "fr",
  "it",
  "pt",
] as const;

export type SupportedGeoLanguage = (typeof SUPPORTED_GEO_LANGUAGES)[number];

export function isSupportedGeoLanguage(
  value: unknown,
): value is SupportedGeoLanguage {
  return SUPPORTED_GEO_LANGUAGES.includes(value as SupportedGeoLanguage);
}

export type LocalizedText = Record<SupportedGeoLanguage, string>;

export type LocalizedAliases = Partial<
  Record<SupportedGeoLanguage, readonly string[]>
>;
