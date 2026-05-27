import { basename } from "node:path";

import type { Country } from "../../src/countries.ts";
import type { SupportedGeoLanguage } from "../../src/geo-language.ts";
import type {
  CountryMap,
  CountryMapPathResolution,
  MapBounds,
  MapRegion,
} from "../../src/map-definition.ts";
import type { OutlyingTerritory } from "../../src/outlying-territories.ts";
import { buildCountryCoreFeature } from "./country-core.ts";
import {
  ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODES,
  ANTIMERIDIAN_DISPLAY_WRAP_OUTLYING_TERRITORY_CODES,
} from "./country-map.ts";
import {
  findMeaningfulCountryPressAreaShapeOverlaps,
  type CountryPressAreaShapeEntry,
  type CountryPressAreaShapePair,
} from "./country-press-area-overlap.ts";
import {
  buildConfiguredCountryPressAreaShape,
  buildCountryPressArea,
  COUNTRY_PRESS_AREA_COUNTRY_CODES,
} from "./country-press-area.ts";
import { findCountryFeature, type CountryFeatureLookup } from "./country.ts";
import { getOutlyingTerritoryConfigs } from "./outlying-territory-config.ts";
import type { RestCountry } from "./rest-countries.ts";
import { extractSourceFeatureParts } from "./source-feature-parts.ts";
import type { GeneratedJsonFile } from "./types.ts";

interface ValidateGeographyGenerationInvariantsParams {
  countries: readonly Country[];
  generatedJsonFiles: readonly GeneratedJsonFile[];
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  mapRegions: readonly MapRegion[];
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

interface ValidateOutlyingTerritoryCountryPressAreasParams {
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
  code: string;
  maximumBoundsWidth: number;
}

interface ValidateExpectedAntimeridianDisplayWrapSanityChecksParams {
  countries: readonly Country[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface ValidateExpectedAntimeridianDisplayWrapEntitySanityChecksParams {
  checks: readonly ExpectedAntimeridianDisplayWrapSanityCheck[];
  entities: readonly MappedEntity[];
  entityKind: "Country" | "Outlying Territory";
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

interface ExpectedLocalizedCapitalSanityCheck {
  capital: string;
  countryCode: string;
  language: SupportedGeoLanguage;
}

interface ValidateExpectedLocalizedCapitalSanityChecksParams {
  countries: readonly Country[];
}

interface ValidateCountryPressAreasParams {
  countries: readonly Country[];
}

interface ValidateCountryPressAreaPayloadParams {
  country: Country;
}

interface ValidateCountryPressAreaOverlapsParams {
  countries: readonly Country[];
}

interface BuildCountryPressAreaShapeEntriesParams {
  countries: readonly Country[];
}

interface ValidateMapRegionNavigationBoundsParams {
  countries: readonly Country[];
  mapRegions: readonly MapRegion[];
  outlyingTerritories: readonly OutlyingTerritory[];
}

interface ValidateContainedMapBoundsParams {
  bounds: MapBounds;
  entityCode: string;
  expectedBounds: MapBounds;
  expectedBoundsLabel: string;
  regionName: string;
}

interface ContainsMapBoundsParams {
  outer: MapBounds;
  inner: MapBounds;
}

interface AreMapBoundsEqualParams {
  left: MapBounds;
  right: MapBounds;
}

interface AreMapBoundsFiniteParams {
  bounds: MapBounds;
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
      code: "FJ",
      maximumBoundsWidth: 15,
    },
    {
      code: "KI",
      maximumBoundsWidth: 70,
    },
    {
      code: "NZ",
      maximumBoundsWidth: 45,
    },
    {
      code: "RU",
      maximumBoundsWidth: 260,
    },
    {
      code: "TO",
      maximumBoundsWidth: 5,
    },
    {
      code: "WS",
      maximumBoundsWidth: 5,
    },
  ];

const EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_OUTLYING_TERRITORY_SANITY_CHECKS: readonly ExpectedAntimeridianDisplayWrapSanityCheck[] =
  [
    {
      code: "AS",
      maximumBoundsWidth: 2,
    },
    {
      code: "US-HI",
      maximumBoundsWidth: 10,
    },
  ];

const PATH_HEAVY_GENERATED_FILE_NAMES = new Set([
  "countries.json",
  "outlying-territories.json",
]);

const EXPECTED_LOCALIZED_CAPITAL_SANITY_CHECKS: readonly ExpectedLocalizedCapitalSanityCheck[] =
  [
    {
      capital: "Londres",
      countryCode: "GB",
      language: "fr",
    },
    {
      capital: "Wien",
      countryCode: "AT",
      language: "de",
    },
    {
      capital: "Bruselas",
      countryCode: "BE",
      language: "es",
    },
    {
      capital: "Pequim",
      countryCode: "CN",
      language: "pt",
    },
    {
      capital: "Roma",
      countryCode: "IT",
      language: "it",
    },
  ];

export function validateGeographyGenerationInvariants({
  countries,
  generatedJsonFiles,
  highResolutionFeatureLookup,
  lowResolutionFeatureLookup,
  mapRegions,
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
  validateOutlyingTerritoryCountryPressAreas({ outlyingTerritories });
  validateExpectedCountryCoreSanityChecks({ countries, outlyingTerritories });
  validateExpectedAntimeridianDisplayWrapSanityChecks({
    countries,
    outlyingTerritories,
  });
  validateCountryPressAreas({ countries });
  validateMapRegionNavigationBounds({
    countries,
    mapRegions,
    outlyingTerritories,
  });
  validateKnownCountryCoreExclusions({
    highResolutionFeatureLookup,
    lowResolutionFeatureLookup,
    restCountries,
  });
  validateExpectedLocalizedCapitalSanityChecks({ countries });
  validateGeneratedJsonFiles({ generatedJsonFiles });
}

function validateCountryPressAreas({
  countries,
}: ValidateCountryPressAreasParams): void {
  const countryPressAreaCountryCodes = countries
    .filter((country) => country.countryPressArea !== undefined)
    .map((country) => country.code);
  const countryPressAreaCountryCodeSet = new Set(countryPressAreaCountryCodes);
  const expectedCountryCodeSet = new Set<string>(
    COUNTRY_PRESS_AREA_COUNTRY_CODES,
  );
  const missingCountryCodes = COUNTRY_PRESS_AREA_COUNTRY_CODES.filter(
    (countryCode) => !countryPressAreaCountryCodeSet.has(countryCode),
  );
  const extraCountryCodes = countryPressAreaCountryCodes.filter(
    (countryCode) => !expectedCountryCodeSet.has(countryCode),
  );

  if (missingCountryCodes.length > 0) {
    throw new Error(
      `Generation invariant failed: missing Country Press Areas for ${missingCountryCodes.join(", ")}.`,
    );
  }

  if (extraCountryCodes.length > 0) {
    throw new Error(
      `Generation invariant failed: unexpected Country Press Areas for ${extraCountryCodes.join(", ")}.`,
    );
  }

  for (const country of countries) {
    if (country.countryPressArea === undefined) {
      continue;
    }

    validateCountryPressAreaPayload({ country });
  }

  validateCountryPressAreaOverlaps({ countries });
}

function validateCountryPressAreaPayload({
  country,
}: ValidateCountryPressAreaPayloadParams): void {
  const { countryPressArea } = country;

  if (countryPressArea === undefined) {
    return;
  }

  const hasPath = countryPressArea.path.trim().length > 0;

  if (!hasPath) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} has an empty Country Press Area path.`,
    );
  }

  const hasFiniteBounds = areMapBoundsFinite({
    bounds: countryPressArea.bounds,
  });
  const hasPositiveBounds =
    countryPressArea.bounds.maxX > countryPressArea.bounds.minX &&
    countryPressArea.bounds.maxY > countryPressArea.bounds.minY;

  if (!hasFiniteBounds || !hasPositiveBounds) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} has invalid Country Press Area bounds.`,
    );
  }

  const expectedCountryPressArea = buildCountryPressArea({
    countryCode: country.code,
    mapBounds: country.map.bounds,
  });

  if (expectedCountryPressArea === undefined) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} has an unconfigured Country Press Area.`,
    );
  }

  const hasExpectedPath =
    countryPressArea.path === expectedCountryPressArea.path;
  const hasExpectedBounds = areMapBoundsEqual({
    left: countryPressArea.bounds,
    right: expectedCountryPressArea.bounds,
  });

  if (!hasExpectedPath || !hasExpectedBounds) {
    throw new Error(
      `Generation invariant failed: Country ${country.code} Country Press Area does not match the configured Country Press Area.`,
    );
  }
}

function validateCountryPressAreaOverlaps({
  countries,
}: ValidateCountryPressAreaOverlapsParams): void {
  const shapeEntries = buildCountryPressAreaShapeEntries({ countries });
  const overlappingPairs = findMeaningfulCountryPressAreaShapeOverlaps({
    shapeEntries,
  });

  if (overlappingPairs.length === 0) {
    return;
  }

  throw new Error(
    `Generation invariant failed: meaningful Country Press Area overlaps detected for ${overlappingPairs.map(formatCountryPressAreaShapePair).join(", ")}.`,
  );
}

function buildCountryPressAreaShapeEntries({
  countries,
}: BuildCountryPressAreaShapeEntriesParams): readonly CountryPressAreaShapeEntry[] {
  return countries.flatMap((country) => {
    if (country.countryPressArea === undefined) {
      return [];
    }

    const shape = buildConfiguredCountryPressAreaShape({
      countryCode: country.code,
      mapBounds: country.map.bounds,
    });

    if (shape === undefined) {
      throw new Error(
        `Generation invariant failed: Country ${country.code} has an unconfigured Country Press Area shape.`,
      );
    }

    return [
      {
        countryCode: country.code,
        shape,
      },
    ];
  });
}

function formatCountryPressAreaShapePair({
  left,
  right,
}: CountryPressAreaShapePair): string {
  return `${left.countryCode}/${right.countryCode}`;
}

function validateMapRegionNavigationBounds({
  countries,
  mapRegions,
  outlyingTerritories,
}: ValidateMapRegionNavigationBoundsParams): void {
  for (const region of mapRegions) {
    const regionCountries = countries.filter((country) =>
      country.regions.includes(region.name),
    );
    const regionOutlyingTerritories = outlyingTerritories.filter(
      (outlyingTerritory) => outlyingTerritory.regions.includes(region.name),
    );

    for (const country of regionCountries) {
      validateContainedMapBounds({
        bounds: region.bounds,
        entityCode: country.code,
        expectedBounds: country.map.bounds,
        expectedBoundsLabel: "Country Core",
        regionName: region.name,
      });

      if (country.countryPressArea === undefined) {
        continue;
      }

      validateContainedMapBounds({
        bounds: region.bounds,
        entityCode: country.code,
        expectedBounds: country.countryPressArea.bounds,
        expectedBoundsLabel: "Country Press Area",
        regionName: region.name,
      });
    }

    for (const outlyingTerritory of regionOutlyingTerritories) {
      validateContainedMapBounds({
        bounds: region.bounds,
        entityCode: outlyingTerritory.code,
        expectedBounds: outlyingTerritory.map.bounds,
        expectedBoundsLabel: "Outlying Territory",
        regionName: region.name,
      });
    }
  }
}

function validateContainedMapBounds({
  bounds,
  entityCode,
  expectedBounds,
  expectedBoundsLabel,
  regionName,
}: ValidateContainedMapBoundsParams): void {
  const hasContainedBounds = containsMapBounds({
    inner: expectedBounds,
    outer: bounds,
  });

  if (hasContainedBounds) {
    return;
  }

  throw new Error(
    `Generation invariant failed: map region ${regionName} does not include ${expectedBoundsLabel} bounds for ${entityCode}.`,
  );
}

function containsMapBounds({ inner, outer }: ContainsMapBoundsParams): boolean {
  return (
    outer.minX <= inner.minX &&
    outer.minY <= inner.minY &&
    outer.maxX >= inner.maxX &&
    outer.maxY >= inner.maxY
  );
}

function areMapBoundsEqual({ left, right }: AreMapBoundsEqualParams): boolean {
  return (
    left.minX === right.minX &&
    left.minY === right.minY &&
    left.maxX === right.maxX &&
    left.maxY === right.maxY
  );
}

function areMapBoundsFinite({ bounds }: AreMapBoundsFiniteParams): boolean {
  return (
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.minY) &&
    Number.isFinite(bounds.maxX) &&
    Number.isFinite(bounds.maxY)
  );
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

function validateOutlyingTerritoryCountryPressAreas({
  outlyingTerritories,
}: ValidateOutlyingTerritoryCountryPressAreasParams): void {
  const outlyingTerritoryCodes = outlyingTerritories
    .filter((outlyingTerritory) => "countryPressArea" in outlyingTerritory)
    .map((outlyingTerritory) => outlyingTerritory.code);

  if (outlyingTerritoryCodes.length === 0) {
    return;
  }

  throw new Error(
    `Generation invariant failed: unexpected Outlying Territory Country Press Areas for ${outlyingTerritoryCodes.join(", ")}.`,
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
  outlyingTerritories,
}: ValidateExpectedAntimeridianDisplayWrapSanityChecksParams): void {
  const configuredCountryCodes = toSortedCodes([
    ...ANTIMERIDIAN_DISPLAY_WRAP_COUNTRY_CODES,
  ]);
  const expectedCountryCodes = toSortedCodes(
    EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_SANITY_CHECKS.map((check) => check.code),
  );
  const hasExpectedConfiguredCountryCodes = isSameCodeList({
    left: configuredCountryCodes,
    right: expectedCountryCodes,
  });

  if (!hasExpectedConfiguredCountryCodes) {
    throw new Error(
      `Generation invariant failed: configured Antimeridian Display Wrap countries ${formatCodeList(configuredCountryCodes)}, expected ${formatCodeList(expectedCountryCodes)}.`,
    );
  }

  const configuredOutlyingTerritoryCodes = toSortedCodes([
    ...ANTIMERIDIAN_DISPLAY_WRAP_OUTLYING_TERRITORY_CODES,
  ]);
  const expectedOutlyingTerritoryCodes = toSortedCodes(
    EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_OUTLYING_TERRITORY_SANITY_CHECKS.map(
      (check) => check.code,
    ),
  );
  const hasExpectedConfiguredOutlyingTerritoryCodes = isSameCodeList({
    left: configuredOutlyingTerritoryCodes,
    right: expectedOutlyingTerritoryCodes,
  });

  if (!hasExpectedConfiguredOutlyingTerritoryCodes) {
    throw new Error(
      `Generation invariant failed: configured Antimeridian Display Wrap Outlying Territories ${formatCodeList(configuredOutlyingTerritoryCodes)}, expected ${formatCodeList(expectedOutlyingTerritoryCodes)}.`,
    );
  }

  validateExpectedAntimeridianDisplayWrapEntitySanityChecks({
    checks: EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_SANITY_CHECKS,
    entities: countries,
    entityKind: "Country",
  });
  validateExpectedAntimeridianDisplayWrapEntitySanityChecks({
    checks: EXPECTED_ANTIMERIDIAN_DISPLAY_WRAP_OUTLYING_TERRITORY_SANITY_CHECKS,
    entities: outlyingTerritories,
    entityKind: "Outlying Territory",
  });
}

function validateExpectedAntimeridianDisplayWrapEntitySanityChecks({
  checks,
  entities,
  entityKind,
}: ValidateExpectedAntimeridianDisplayWrapEntitySanityChecksParams): void {
  for (const check of checks) {
    const entity = entities.find(
      (candidateEntity) => candidateEntity.code === check.code,
    );

    if (entity === undefined) {
      throw new Error(
        `Generation invariant failed: missing Antimeridian Display Wrap ${entityKind} ${check.code}.`,
      );
    }

    const boundsWidth = getBoundsWidth(entity.map.bounds);
    const hasMaximumWidth = boundsWidth <= check.maximumBoundsWidth;

    if (hasMaximumWidth) {
      continue;
    }

    throw new Error(
      `Generation invariant failed: ${entityKind} ${entity.code} Antimeridian Display Wrap bounds are too wide. Width ${boundsWidth}, expected at most ${check.maximumBoundsWidth}.`,
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

function validateExpectedLocalizedCapitalSanityChecks({
  countries,
}: ValidateExpectedLocalizedCapitalSanityChecksParams): void {
  const countriesByCode = new Map(
    countries.map((country) => [country.code, country]),
  );

  for (const check of EXPECTED_LOCALIZED_CAPITAL_SANITY_CHECKS) {
    const country = countriesByCode.get(check.countryCode);

    if (country === undefined) {
      throw new Error(
        `Generation invariant failed: missing country ${check.countryCode} for localized capital sanity check.`,
      );
    }

    const capital = country.capital[check.language];

    if (capital === check.capital) {
      continue;
    }

    throw new Error(
      `Generation invariant failed: expected ${check.countryCode} capital in ${check.language} to be ${check.capital}, but got ${capital}.`,
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
