import {
  type LocalizedText,
  type SupportedGeoLanguage,
} from "../../src/geo-language.ts";

interface BuildLocalizedTextParams {
  getValue: (language: SupportedGeoLanguage) => string;
}

// Normalize typographic apostrophes (esp. the okina U+02BB, which Unicode classes as a letter so the quiz answer filter never strips it) to a plain "'" that stays typeable on mobile keyboards.
const APOSTROPHE_LIKE_PATTERN = /[ʻʼʽ‘’′]/g;

function sanitizeLocalizedValue(value: string): string {
  return value.replace(APOSTROPHE_LIKE_PATTERN, "'");
}

export function buildLocalizedText({
  getValue,
}: BuildLocalizedTextParams): LocalizedText {
  return {
    de: sanitizeLocalizedValue(getValue("de")),
    en: sanitizeLocalizedValue(getValue("en")),
    es: sanitizeLocalizedValue(getValue("es")),
    fr: sanitizeLocalizedValue(getValue("fr")),
    it: sanitizeLocalizedValue(getValue("it")),
    pt: sanitizeLocalizedValue(getValue("pt")),
  };
}
