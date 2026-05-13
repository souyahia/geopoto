import { match } from "ts-pattern";

import type { SupportedLocale } from "@/services/i18n/locale";

export function getLanguageName(locale: SupportedLocale) {
  return match(locale)
    .with("de", () => "Deutsch")
    .with("en", () => "English")
    .with("es", () => "Español")
    .with("fr", () => "Français")
    .with("it", () => "Italiano")
    .with("pt", () => "Português")
    .exhaustive();
}
