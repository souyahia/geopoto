import type { LocalizedAliases } from "../../src/geo-language.ts";

export interface CountryAliasesConfig {
  capital?: LocalizedAliases;
  name?: LocalizedAliases;
}

/**
 * Developer-authored accepted answers for text questions, in addition to the
 * canonical localized name/capital generated from the data sources.
 *
 * The canonical answer is always accepted, so it does not need to be repeated
 * here. Only list extra spellings, abbreviations, or alternative names.
 *
 * Every accepted answer (canonical and aliases) is matched case, accent, space
 * and punctuation insensitively (see `normalizeQuizzTextAnswer` in the mobile
 * app), so there is no need to add variants that only differ by those.
 *
 * Aliases must not collide across countries once normalized. The generation
 * invariants enforce this (see `validateAnswerAliasUniqueness`).
 */
export const COUNTRY_ALIASES_CONFIGS: Readonly<
  Record<string, CountryAliasesConfig>
> = {
  AE: {
    name: {
      de: ["VAE"],
      en: ["UAE", "Emirates"],
      es: ["EAU"],
      fr: ["EAU"],
      it: ["EAU"],
      pt: ["EAU"],
    },
  },
  BA: {
    name: {
      de: ["Bosnien"],
      es: ["Bosnia"],
      it: ["Bosnia"],
      pt: ["Bosnia"],
    },
  },
  BN: {
    name: {
      en: ["Brunei Darussalam"],
      fr: ["Brunei Darussalam"],
    },
  },
  BY: {
    name: {
      de: ["Belarus"],
    },
  },
  CD: {
    name: {
      de: ["DR Kongo", "Demokratische Republik Kongo", "Kongo-Kinshasa"],
      en: ["DRC", "Democratic Republic of the Congo", "Congo Kinshasa"],
      es: [
        "RDC",
        "RD Congo",
        "Congo Kinsasa",
        "Republica Democratica del Congo",
      ],
      fr: [
        "République Démocratique du Congo",
        "RD Congo",
        "RDC",
        "Congo Kinshasa",
      ],
      it: [
        "RDC",
        "RD Congo",
        "Repubblica Democratica del Congo",
        "Congo Kinshasa",
      ],
      pt: ["RDC", "RD Congo", "Congo Kinshasa"],
    },
  },
  CF: {
    name: {
      en: ["CAR"],
      fr: ["Centrafrique"],
    },
  },
  CG: {
    name: {
      de: ["Republik Kongo", "Kongo-Brazzaville"],
      en: ["Congo Brazzaville", "Congo Republic"],
      es: ["Congo Brazzaville", "Republica del Congo"],
      fr: ["République du Congo", "Congo Brazzaville"],
      it: ["Repubblica del Congo", "Congo Brazzaville"],
      pt: ["Congo Brazzaville", "Republica do Congo"],
    },
  },
  CI: {
    name: {
      en: ["Cote d'Ivoire"],
    },
  },
  CN: {
    capital: {
      en: ["Peking"],
      es: ["Beijing"],
      fr: ["Beijing"],
      pt: ["Beijing"],
    },
  },
  CV: {
    name: {
      de: ["Cabo Verde"],
      en: ["Cabo Verde"],
      fr: ["Cap Vert"],
    },
  },
  CZ: {
    name: {
      de: ["Tschechische Republik", "Tschechei"],
      en: ["Czech Republic"],
      es: ["Republica Checa"],
      fr: ["République Tchèque"],
      it: ["Repubblica Ceca"],
      pt: ["Republica Checa", "Tchequia", "Republica Tcheca"],
    },
  },
  GB: {
    name: {
      de: ["Großbritannien", "UK"],
      en: ["UK", "Britain", "Great Britain"],
      es: ["RU", "UK", "Gran Bretana"],
      fr: ["UK", "Grande-Bretagne"],
      it: ["Gran Bretagna"],
      pt: ["RU"],
    },
  },
  IR: {
    name: {
      pt: ["Ira"],
    },
  },
  KN: {
    name: {
      fr: ["Saint-Kitts-et-Nevis"],
    },
  },
  MD: {
    name: {
      de: ["Moldau"],
    },
  },
  MK: {
    name: {
      it: ["Macedonia"],
    },
  },
  MM: {
    name: {
      de: ["Birma", "Burma"],
      en: ["Burma"],
      es: ["Birmania"],
      fr: ["Myanmar"],
      it: ["Myanmar"],
      pt: ["Birmania"],
    },
    capital: {
      es: ["Naypyidaw"],
    },
  },
  MN: {
    capital: {
      en: ["Ulaanbaatar"],
    },
  },
  NL: {
    name: {
      de: ["Holland"],
      en: ["Holland"],
      es: ["Holanda"],
      fr: ["Hollande"],
      it: ["Olanda"],
      pt: ["Paises Baixos"],
    },
  },
  PW: {
    name: {
      fr: ["Palaos", "Palau"],
    },
  },
  QA: {
    name: {
      es: ["Qatar"],
    },
  },
  SZ: {
    name: {
      de: ["Eswatini"],
      en: ["Swaziland"],
      es: ["Esuatini", "Eswatini"],
      fr: ["Eswatini"],
      it: ["Eswatini"],
      pt: ["Essuatini", "Eswatini"],
    },
  },
  TL: {
    name: {
      de: ["Timor-Leste"],
      en: ["East Timor"],
      es: ["Timor-Leste"],
      fr: ["Timor-Leste"],
      pt: ["Timor Oriental"],
    },
  },
  UA: {
    capital: {
      es: ["Kyiv"],
      fr: ["Kyiv"],
      pt: ["Kyiv"],
    },
  },
  US: {
    name: {
      de: ["USA", "Vereinigte Staaten von Amerika", "Amerika"],
      en: ["USA", "US", "United States of America", "America"],
      es: ["EEUU", "USA", "Estados Unidos de America"],
      fr: ["USA", "États-Unis d'Amérique", "Amérique"],
      it: ["USA", "Stati Uniti"],
      pt: ["EUA", "USA", "Estados Unidos da America"],
    },
  },
  VA: {
    name: {
      en: ["Vatican", "Holy See"],
      fr: ["Vatican", "Saint-Siège"],
      it: ["Vaticano", "Santa Sede"],
    },
  },
  VN: {
    name: {
      pt: ["Vietna"],
    },
  },
};

export function getCountryNameAliases(
  countryCode: string,
): LocalizedAliases | undefined {
  return COUNTRY_ALIASES_CONFIGS[countryCode]?.name;
}

export function getCountryCapitalAliases(
  countryCode: string,
): LocalizedAliases | undefined {
  return COUNTRY_ALIASES_CONFIGS[countryCode]?.capital;
}
