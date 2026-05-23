import type { Continent } from "../../src/countries.ts";
import type { LocalizedText } from "../../src/geo-language.ts";
import type { MapRegionName } from "../../src/map-definition.ts";
import type { GeographicBounds } from "./source-feature-parts.ts";

export interface RestCountriesOutlyingTerritoryMetadataConfig {
  type: "restCountries";
}

export interface AppDefinedOutlyingTerritoryMetadataConfig {
  continent: Continent;
  name: LocalizedText;
  regions: readonly MapRegionName[];
  type: "appDefined";
}

export type OutlyingTerritoryMetadataConfig =
  | AppDefinedOutlyingTerritoryMetadataConfig
  | RestCountriesOutlyingTerritoryMetadataConfig;

export interface OutlyingTerritoryConfig {
  code: string;
  countryCode: string;
  metadata: OutlyingTerritoryMetadataConfig;
  sourceBoundsList: readonly GeographicBounds[];
  sourceCountryCode: string;
}

export const OUTLYING_TERRITORY_CONFIGS: readonly OutlyingTerritoryConfig[] = [
  {
    code: "GF",
    countryCode: "FR",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 6,
        maxLongitude: -51,
        minLatitude: 2,
        minLongitude: -55,
      },
    ],
    sourceCountryCode: "FR",
  },
  {
    code: "GP",
    countryCode: "FR",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 16.6,
        maxLongitude: -60.9,
        minLatitude: 15.7,
        minLongitude: -62.1,
      },
    ],
    sourceCountryCode: "FR",
  },
  {
    code: "MQ",
    countryCode: "FR",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 15,
        maxLongitude: -60.7,
        minLatitude: 14.3,
        minLongitude: -61.4,
      },
    ],
    sourceCountryCode: "FR",
  },
  {
    code: "RE",
    countryCode: "FR",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: -20.7,
        maxLongitude: 56,
        minLatitude: -21.6,
        minLongitude: 55,
      },
    ],
    sourceCountryCode: "FR",
  },
  {
    code: "YT",
    countryCode: "FR",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: -12.4,
        maxLongitude: 45.4,
        minLatitude: -13.1,
        minLongitude: 44.9,
      },
    ],
    sourceCountryCode: "FR",
  },
  {
    code: "EC-GAL",
    countryCode: "EC",
    metadata: {
      continent: "south-america",
      name: {
        de: "Galapagosinseln",
        en: "Galápagos Islands",
        es: "Islas Galápagos",
        fr: "îles Galápagos",
        it: "Isole Galápagos",
        pt: "Ilhas Galápagos",
      },
      regions: ["world", "south-america"],
      type: "appDefined",
    },
    sourceBoundsList: [
      {
        maxLatitude: 1,
        maxLongitude: -89,
        minLatitude: -1.5,
        minLongitude: -92,
      },
    ],
    sourceCountryCode: "EC",
  },
  {
    code: "GL",
    countryCode: "DK",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 84,
        maxLongitude: -11,
        minLatitude: 59,
        minLongitude: -74,
      },
    ],
    sourceCountryCode: "GL",
  },
  {
    code: "FO",
    countryCode: "DK",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 63,
        maxLongitude: -6,
        minLatitude: 61,
        minLongitude: -8,
      },
    ],
    sourceCountryCode: "FO",
  },
  {
    code: "AW",
    countryCode: "NL",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 12.7,
        maxLongitude: -69.8,
        minLatitude: 12.3,
        minLongitude: -70.2,
      },
    ],
    sourceCountryCode: "AW",
  },
  {
    code: "BQ",
    countryCode: "NL",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 12.4,
        maxLongitude: -68.1,
        minLatitude: 12,
        minLongitude: -68.5,
      },
      {
        maxLatitude: 17.6,
        maxLongitude: -62.8,
        minLatitude: 17.4,
        minLongitude: -63.1,
      },
      {
        maxLatitude: 17.8,
        maxLongitude: -63.1,
        minLatitude: 17.5,
        minLongitude: -63.4,
      },
    ],
    sourceCountryCode: "NL",
  },
  {
    code: "CW",
    countryCode: "NL",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 12.5,
        maxLongitude: -68.6,
        minLatitude: 11.9,
        minLongitude: -69.3,
      },
    ],
    sourceCountryCode: "CW",
  },
  {
    code: "SX",
    countryCode: "NL",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 18.2,
        maxLongitude: -62.9,
        minLatitude: 17.9,
        minLongitude: -63.2,
      },
    ],
    sourceCountryCode: "SX",
  },
  {
    code: "US-HI",
    countryCode: "US",
    metadata: {
      continent: "oceania",
      name: {
        de: "Hawaii",
        en: "Hawaii",
        es: "Hawái",
        fr: "Hawaï",
        it: "Hawaii",
        pt: "Havaí",
      },
      regions: ["world", "oceania"],
      type: "appDefined",
    },
    sourceBoundsList: [
      {
        maxLatitude: 23,
        maxLongitude: -154,
        minLatitude: 18,
        minLongitude: -161,
      },
    ],
    sourceCountryCode: "US",
  },
  {
    code: "PR",
    countryCode: "US",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 18.7,
        maxLongitude: -65.2,
        minLatitude: 17.8,
        minLongitude: -68.1,
      },
    ],
    sourceCountryCode: "PR",
  },
  {
    code: "GU",
    countryCode: "US",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 13.8,
        maxLongitude: 145.1,
        minLatitude: 13.1,
        minLongitude: 144.5,
      },
    ],
    sourceCountryCode: "GU",
  },
  {
    code: "AS",
    countryCode: "US",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: -14.1,
        maxLongitude: -170.4,
        minLatitude: -14.5,
        minLongitude: -171,
      },
    ],
    sourceCountryCode: "AS",
  },
  {
    code: "MP",
    countryCode: "US",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 19,
        maxLongitude: 146,
        minLatitude: 14,
        minLongitude: 145,
      },
    ],
    sourceCountryCode: "MP",
  },
  {
    code: "VI",
    countryCode: "US",
    metadata: {
      type: "restCountries",
    },
    sourceBoundsList: [
      {
        maxLatitude: 18.5,
        maxLongitude: -64.5,
        minLatitude: 17.6,
        minLongitude: -65.1,
      },
    ],
    sourceCountryCode: "VI",
  },
];

export function getOutlyingTerritorySourceBounds(
  countryCode: string,
): readonly GeographicBounds[] {
  return getOutlyingTerritoryConfigs(countryCode).flatMap(
    (config) => config.sourceBoundsList,
  );
}

export function getOutlyingTerritoryConfigs(
  countryCode: string,
): readonly OutlyingTerritoryConfig[] {
  return OUTLYING_TERRITORY_CONFIGS.filter(
    (config) => config.countryCode === countryCode,
  );
}

export function getOutlyingTerritoryCodes(
  countryCode: string,
): readonly string[] {
  return getOutlyingTerritoryConfigs(countryCode)
    .map((config) => config.code)
    .toSorted((left, right) => left.localeCompare(right));
}
