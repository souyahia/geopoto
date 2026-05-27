import {
  type LocalizedText,
  type SupportedGeoLanguage,
} from "../../src/geo-language.ts";

interface BuildLocalizedTextParams {
  getValue: (language: SupportedGeoLanguage) => string;
}

export function buildLocalizedText({
  getValue,
}: BuildLocalizedTextParams): LocalizedText {
  return {
    de: getValue("de"),
    en: getValue("en"),
    es: getValue("es"),
    fr: getValue("fr"),
    it: getValue("it"),
    pt: getValue("pt"),
  };
}
