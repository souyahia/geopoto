import { basename } from "node:path";

import type { Country } from "../../src/countries.ts";
import type {
  CountryMap,
  CountryMapPathResolution,
  MapBounds,
} from "../../src/map-definition.ts";
import type { OutlyingTerritory } from "../../src/outlying-territories.ts";
import { buildCountryCoreFeature } from "./country-core.ts";
import {
  findCountryFeature,
  type CountryFeatureLookup,
} from "./country.ts";
import { ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODES } from "./country-map.ts";
import { getOutlyingTerritoryConfigs } from "./outlying-territory-config.ts";
import type { RestCountry } from "./rest-countries.ts";
import { extractSourceFeatureParts } from "./source-feature-parts.ts";
import type { GeneratedJsonFile } from "./types.ts";

interface ValidateGeographyGenerationInvariantsParams {
  countries: readonly Country[];
  generatedJsonFiles: readonly GeneratedJsonFile[];
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  outlyingTerritories: readonly OutlyingTerritory[];
  restCountries: readonly RestCountry[];
}

interface ValidateMapPathsParams {
  entities: readonly MappedEntity[];
  entityKind: "Country Core" | "Outlying Territory";
}

interface MappedEntity {
  code: string;
  map: CountryMap;
}

interface ValidateOutlyingTerritoryCountriesParams {
  countries: readonly Country[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface ValidateCountryOutlyingTerritoryCodesParams {
  countries: readonly Country[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface ExpectedCountryCoreSanityCheck {
  countryCode: string;
  maximumBoundsWidth?: number;
  minimumBoundsHeight: number;
  minimumBoundsWidth: number;
  outlyingTerritoryCodes: readonly string[];
}

interface ValidateExpectedCountryCoreSanityChecksParams {
  countries: readonly Country[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface ExpectedAntimeridianDisplayWrapSanityCheck {
  countryCode: string;
  maximumBoundsWidth: number;
}

interface ValidateExpectedAntimeridianDisplayWrapSanityChecksParams {
  countries: readonly Country[];
}

interface IsSameCodeListParams {
  left: readonly string[];
  right: readonly string[];
}

interface ValidateKnownCountryCoreExclusionsParams {
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  restCountries: readonly RestCountry[];
}

interface ValidateKnownCountryCoreExclusionsForResolutionParams {
  countryCode: string;
  featureLookup: CountryFeatureLookup;
  pathResolution: CountryMapPathResolution;
  restCountry: RestCountry;
}

interface ValidateGeneratedJsonFilesParams {
  generatedJsonFiles: readonly GeneratedJsonFile[];
}

const MAP_PATH_RESOLUTIONS: readonly CountryMapPathResolution[] = [
  "highResolution",
  "lowResolution",
];

const EXPECTED_COUNTRY_CORE_SANITY_CHECKS: readonly ExpectedCountryCoreSanityCheck[] =
  [
    {
      countryCode: "AU",
      minimumBoundsHeight: 40,
      minimumBoundsWidth: 40,
      outlyingTerritoryCodes: [],
    },
    {
      countryCode: "DK",
      minimumBoundsHeight: 5,
      minimumBoundsWidth: 5,
      outlyingTerritoryCodes: ["FO", "GL"],
    },
    {
      countryCode: "EC",
      minimumBoundsHeight: 8,
      minimumBoundsWidth: 7,
      outlyingTerritoryCodes: ["EC-GAL"],
    },
    {
      countryCode: "FR",
      minimumBoundsHeight: 10,
      minimumBoundsWidth: 10,
      outlyingTerritoryCodes: ["GF", "GP", "MQ", "RE", "YT"],
    },
    {
      countryCode: "NL",
      minimumBoundsHeight: 3,
      minimumBoundsWidth: 3,
      outlyingTerritoryCodes: ["AW", "BQ", "CW", "SX"],
    },
    {
      countryCode: "NO",
      minimumBoundsHeight: 40,
      minimumBoundsWidth: 35,
      outlyingTerritoryCodes: ["SJ"],
    },
    {
      countryCode: "PT",
      maximumBoundsWidth: 10,
      minimumBoundsHeight: 8,
      minimumBoundsWidth: 4,
      outlyingTerritoryCodes: ["PT-AZO", "PT-MAD"],
    },
    {
      countryCode: "US",
      maximumBoundsWidth: 160,
      minimumBoundsHeight: 50,
      minimumBoundsWidth: 140,
      outlyingTerritoryCodes: ["AS", "GU", "MP", "PR", "US-HI", "VI"],
    },
  ];

const EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_SANITY_CHECKS: readonly ExpectedAntimeridianDisplayWrapSanityCheck[] =
  [
    {
      countryCode: "FJ",
      maximumBoundsWidth: 15,
    },
    {
      countryCode: "KI",
      maximumBoundsWidth: 70,
    },
    {
      countryCode: "NZ",
      maximumBoundsWidth: 45,
    },
    {
      countryCode: "RU",
      maximumBoundsWidth: 260,
    },
  ];

const PATH_HEAVY_GENERATED_FILE_NAMES = new Set([
  "countries.json",
  "outlying-territories.json",
]);

export function validateGeographyGenerationInvariants({
  countries,
  generatedJsonFiles,
  highResolutionFeatureLookup,
  lowResolutionFeatureLookup,
  outlyingTerritories,
  restCountries,
}: ValidateGeographyGenerationInvariantsParams): void {
  validateMapPaths({
    entities: countries,
    entityKind: "Country Core",
  });
  validateMapPaths({
    entities: outlyingTerritories,
    entityKind: "Outlying Territory",
  });
  validateOutlyingTerritoryCountries({ countries, outlyingTerritories });
  validateCountryOutlyingTerritoryCodes({ countries, outlyingTerritories });
  validateExpectedCountryCoreSanityChecks({ countries, outlyingTerritories });
  validateExpectedAntimeridianDisplayWrapSanityChecks({ countries });
  validateKnownCountryCoreExclusions({
    highResolutionFeatureLookup,
    lowResolutionFeatureLookup,
    restCountries,
  });
  validateGeneratedJsonFiles({ generatedJsonFiles });
}

function validateMapPaths({
  entities,
  entityKind,
}: ValidateMapPathsParams): void {
  for (const entity of entities) {
    for (const pathResolution of MAP_PATH_RESOLUTIONS) {
      const path = entity.map.paths[pathResolution];
      const hasPath = path.trim().length > 0;

      if (!hasPath) {
        throw new Error(
          `Generation invariant failed: ${entityKind} ${entity.code} has an empty ${pathResolution} map path.`,
        );
      }
    }
  }
}

function validateOutlyingTerritoryCountries({
  countries,
  outlyingTerritories,
}: ValidateOutlyingTerritoryCountriesParams): void {
  const countryCodes = new Set(countries.map((country) => country.code));
  const outlyingTerritory = outlyingTerritories.find(
    (territory) => !countryCodes.has(territory.countryCode),
  );

  if (outlyingTerritory === undefined) {
    return;
  }

  throw new Error(
    `Generation invariant failed: Outlying Territory ${outlyingTerritory.code} references missing Country ${outlyingTerritory.countryCode}.`,
  );
}

function validateCountryOutlyingTerritoryCodes({
  countries,
  outlyingTerritories,
}: ValidateCountryOutlyingTerritoryCodesParams): void {
  const outlyingTerritoryCodes = new Set(
    outlyingTerritories.map((territory) => territory.code),
  );
  const country = countries.find((candidateCountry) =>
    (candidateCountry.outlyingTerritoryCodes ?? []).some(
      (code) => !outlyingTerritoryCodes.has(code),
    ),
  );

  if (country === undefined) {
    return;
  }

  const missingOutlyingTerritoryCode = (
    country.outlyingTerritoryCodes ?? []
  ).find((code) => !outlyingTerritoryCodes.has(code));

  if (missingOutlyingTerritoryCode === undefined) {
    return;
  }

  throw new Error(
    `Generation invariant failed: Country ${country.code} references missing Outlying Territory ${missingOutlyingTerritoryCode}.`,
  );
}

function validateExpectedCountryCoreSanityChecks({
  countries,
  outlyingTerritories,
}: ValidateExpectedCountryCoreSanityChecksParams): void {
  for (const check of EXPECTED_COUNTRY_CORE_SANITY_CHECKS) {
    const country = countries.find(
      (candidateCountry) => candidateCountry.code === check.countryCode,
    );

    if (country === undefined) {
      throw new Error(
        `Generation invariant failed: missing Country Core sanity check country ${check.countryCode}.`,
      );
    }

    validateCountryCoreSanityCheck({
      check,
      country,
      outlyingTerritories,
    });
  }
}

interface ValidateCountryCoreSanityCheckParams {
  check: ExpectedCountryCoreSanityCheck;
  country: Country;
  outlyingTerritories: readonly OutlyingTerritory[];
}

function validateCountryCoreSanityCheck({
  check,
  country,
  outlyingTerritories,
}: ValidateCountryCoreSanityCheckParams): void {
  const countryOutlyingTerritoryCodes = toSortedCodes(
    country.outlyingTerritoryCodes ?? [],
  );
  const expectedOutlyingTerritoryCodes = toSortedCodes(
    check.outlyingTerritoryCodes,
  );
  const hasExpectedCountryCodes = isSameCodeList({
    left: countryOutlyingTerritoryCodes,
    right: expectedOutlyingTerritoryCodes,
  });

  if (!hasExpectedCountryCodes) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} references ${formatCodeList(countryOutlyingTerritoryCodes)} Outlying Territories, expected ${formatCodeList(expectedOutlyingTerritoryCodes)}.`,
    );
  }

  const generatedOutlyingTerritoryCodes = toSortedCodes(
    outlyingTerritories
      .filter((territory) => territory.countryCode === check.countryCode)
      .map((territory) => territory.code),
  );
  const hasExpectedGeneratedTerritories = isSameCodeList({
    left: generatedOutlyingTerritoryCodes,
    right: expectedOutlyingTerritoryCodes,
  });

  if (!hasExpectedGeneratedTerritories) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} has generated Outlying Territories ${formatCodeList(generatedOutlyingTerritoryCodes)}, expected ${formatCodeList(expectedOutlyingTerritoryCodes)}.`,
    );
  }

  validateCountryCoreBounds({ check, country });
}

interface ValidateCountryCoreBoundsParams {
  check: ExpectedCountryCoreSanityCheck;
  country: Country;
}

function validateCountryCoreBounds({
  check,
  country,
}: ValidateCountryCoreBoundsParams): void {
  const boundsWidth = getBoundsWidth(country.map.bounds);
  const boundsHeight = getBoundsHeight(country.map.bounds);
  const hasMinimumWidth = boundsWidth >= check.minimumBoundsWidth;
  const hasMinimumHeight = boundsHeight >= check.minimumBoundsHeight;

  if (!hasMinimumWidth || !hasMinimumHeight) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} Country Core bounds are too small. Width ${boundsWidth}, height ${boundsHeight}.`,
    );
  }

  if (check.maximumBoundsWidth === undefined) {
    return;
  }

  const hasMaximumWidth = boundsWidth <= check.maximumBoundsWidth;

  if (hasMaximumWidth) {
    return;
  }

  throw new Error(
    `Generation invariant failed: Country ${country.code} Country Core bounds are too wide. Width ${boundsWidth}, expected at most ${check.maximumBoundsWidth}.`,
  );
}

function validateExpectedAntimeridianDisplayWrapSanityChecks({
  countries,
}: ValidateExpectedAntimeridianDisplayWrapSanityChecksParams): void {
  const configuredCodes = toSortedCodes([
    ...ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODES,
  ]);
  const expectedCodes = toSortedCodes(
    EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_SANITY_CHECKS.map(
      (check) => check.countryCode,
    ),
  );
  const hasExpectedConfiguredCodes = isSameCodeList({
    left: configuredCodes,
    right: expectedCodes,
  });

  if (!hasExpectedConfiguredCodes) {
    throw new Error(
      `Generation invariant failed: configured Antimeridian Display Wrap countries ${formatCodeList(configuredCodes)}, expected ${formatCodeList(expectedCodes)}.`,
    );
  }

  for (const check of EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_SANITY_CHECKS) {
    const country = countries.find(
      (candidateCountry) => candidateCountry.code === check.countryCode,
    );

    if (country === undefined) {
      throw new Error(
        `Generation invariant failed: missing Antimeridian Display Wrap country ${check.countryCode}.`,
      );
    }

    const boundsWidth = getBoundsWidth(country.map.bounds);
    const hasMaximumWidth = boundsWidth <= check.maximumBoundsWidth;

    if (hasMaximumWidth) {
      continue;
    }

    throw new Error(
      `Generation invariant failed: Country ${country.code} Antimeridian Display Wrap bounds are too wide. Width ${boundsWidth}, expected at most ${check.maximumBoundsWidth}.`,
    );
  }
}

function validateKnownCountryCoreExclusions({
  highResolutionFeatureLookup,
  lowResolutionFeatureLookup,
  restCountries,
}: ValidateKnownCountryCoreExclusionsParams): void {
  const restCountriesByCode = new Map(
    restCountries.map((restCountry) => [restCountry.cca2, restCountry]),
  );

  for (const check of EXPECTED_COUNTRY_CORE_SANITY_CHECKS) {
    const restCountry = restCountriesByCode.get(check.countryCode);

    if (restCountry === undefined) {
      throw new Error(
        `Generation invariant failed: missing RestCountries metadata for Country Core sanity check country ${check.countryCode}.`,
      );
    }

    validateKnownCountryCoreExclusionsForResolution({
      countryCode: check.countryCode,
      featureLookup: highResolutionFeatureLookup,
      pathResolution: "highResolution",
      restCountry,
    });
    validateKnownCountryCoreExclusionsForResolution({
      countryCode: check.countryCode,
      featureLookup: lowResolutionFeatureLookup,
      pathResolution: "lowResolution",
      restCountry,
    });
  }
}

function validateKnownCountryCoreExclusionsForResolution({
  countryCode,
  featureLookup,
  pathResolution,
  restCountry,
}: ValidateKnownCountryCoreExclusionsForResolutionParams): void {
  const countryCoreFeature = buildCountryCoreFeature({
    countryCode,
    feature: findCountryFeature({ featureLookup, restCountry }),
  });

  if (countryCoreFeature === null) {
    throw new Error(
      `Generation invariant failed: Country ${countryCode} has no ${pathResolution} Country Core source feature for sanity checks.`,
    );
  }

  for (const config of getOutlyingTerritoryConfigs(countryCode)) {
    for (const [
      boundsIndex,
      sourceBounds,
    ] of config.sourceBoundsList.entries()) {
      const includedOutlyingTerritoryFeature = extractSourceFeatureParts({
        boundsList: [sourceBounds],
        code: `${countryCode}:${config.code}:${boundsIndex}:${pathResolution}`,
        feature: countryCoreFeature,
        sourceName: countryCode,
      });

      if (includedOutlyingTerritoryFeature !== null) {
        throw new Error(
          `Generation invariant failed: Country ${countryCode} ${pathResolution} Country Core still includes configured Outlying Territory ${config.code} source bounds ${boundsIndex + 1}.`,
        );
      }
    }
  }
}

function validateGeneratedJsonFiles({
  generatedJsonFiles,
}: ValidateGeneratedJsonFilesParams): void {
  for (const generatedJsonFile of generatedJsonFiles) {
    const fileName = basename(generatedJsonFile.path);
    const isAllowedPathFile = PATH_HEAVY_GENERATED_FILE_NAMES.has(fileName);
    const hasMapPathData = hasGeneratedMapPathData(generatedJsonFile.data);

    if (isAllowedPathFile || !hasMapPathData) {
      continue;
    }

    throw new Error(
      `Generation invariant failed: generated file ${fileName} contains map paths. Keep path-heavy neutral base map data in Countries and Outlying Territories only.`,
    );
  }
}

function getBoundsWidth(bounds: MapBounds): number {
  return bounds.maxX - bounds.minX;
}

function getBoundsHeight(bounds: MapBounds): number {
  return bounds.maxY - bounds.minY;
}

function isSameCodeList({ left, right }: IsSameCodeListParams): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((code, index) => code === right[index]);
}

function toSortedCodes(codes: readonly string[]): readonly string[] {
  return codes.toSorted((left, right) => left.localeCompare(right));
}

function formatCodeList(codes: readonly string[]): string {
  if (codes.length === 0) {
    return "no";
  }

  return codes.join(", ");
}

function hasGeneratedMapPathData(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasGeneratedMapPathData);
  }

  if (!isUnknownRecord(value)) {
    return false;
  }

  if (isMapPathRecord(value)) {
    return true;
  }

  return Object.values(value).some(hasGeneratedMapPathData);
}

function isUnknownRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function isMapPathRecord(value: Readonly<Record<string, unknown>>): boolean {
  return (
    typeof value.highResolution === "string" &&
    typeof value.lowResolution === "string"
  );
}
