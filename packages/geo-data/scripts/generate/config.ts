import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { RestCountriesTranslationConfig } from "./types.ts";

const CURRENT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

export const PACKAGE_DIRECTORY = resolve(CURRENT_DIRECTORY, "../..");
export const GENERATED_DIRECTORY = resolve(PACKAGE_DIRECTORY, "generated");
export const GENERATED_FLAGS_DIRECTORY = resolve(GENERATED_DIRECTORY, "flags");
export const GENERATED_FLAG_PNGS_DIRECTORY = resolve(
  GENERATED_DIRECTORY,
  "flags-png",
);
export const GENERATED_LOW_RESOLUTION_FLAG_PNGS_DIRECTORY = resolve(
  GENERATED_DIRECTORY,
  "flags-png-low",
);
export const FLAG_PNG_MAX_SIZE = 900;
export const LOW_RESOLUTION_FLAG_PNG_MAX_SIZE = 32;
export const LOW_RESOLUTION_FLAG_PNG_SCALES = [1, 2, 3] as const;

const REST_COUNTRIES_FIELDS = [
  "name",
  "translations",
  "capital",
  "cca2",
  "ccn3",
  "region",
  "subregion",
  "latlng",
  "independent",
  "unMember",
];

export const REST_COUNTRIES_URL = `https://restcountries.com/v3.1/all?fields=${REST_COUNTRIES_FIELDS.join(",")}`;

export const REST_COUNTRIES_TRANSLATION_CONFIG: readonly RestCountriesTranslationConfig[] =
  [
    {
      language: "de",
      restCountriesCode: "deu",
    },
    {
      language: "en",
      restCountriesCode: null,
    },
    {
      language: "es",
      restCountriesCode: "spa",
    },
    {
      language: "fr",
      restCountriesCode: "fra",
    },
    {
      language: "it",
      restCountriesCode: "ita",
    },
    {
      language: "pt",
      restCountriesCode: "por",
    },
  ];

export const MAP_REGION_PADDING_RATIO = 0.06;
