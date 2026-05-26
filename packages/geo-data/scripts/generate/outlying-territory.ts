import type { GeoPath, GeoProjection } from "d3-geo";

import type { OutlyingTerritory } from "../../src/outlying-territories.ts";
import { applyAntimeridianDisplayWrap, toMapBounds } from "./country-map.ts";
import {
  findCountryFeature,
  toContinent,
  toLocalizedCountryName,
  toMapRegions,
  type CountryFeatureLookup,
} from "./country.ts";
import {
  OUTLYING_TERRITORY_CONFIGS,
  type OutlyingTerritoryConfig,
} from "./outlying-territory-config.ts";
import type { RestCountry } from "./rest-countries.ts";
import { extractSourceFeatureParts } from "./source-feature-parts.ts";
import type { CountryFeature } from "./types.ts";

interface BuildOutlyingTerritoriesParams {
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountries: readonly RestCountry[];
}

interface BuildOutlyingTerritoryParams {
  config: OutlyingTerritoryConfig;
  highResolutionFeatureLookup: CountryFeatureLookup;
  lowResolutionFeatureLookup: CountryFeatureLookup;
  pathGenerator: GeoPath;
  projection: GeoProjection;
  restCountries: readonly RestCountry[];
}

interface BuildOutlyingTerritoryMapParams {
  config: OutlyingTerritoryConfig;
  highResolutionSourceFeature: CountryFeature | null;
  lowResolutionSourceFeature: CountryFeature | null;
  metadata: ResolvedOutlyingTerritoryMetadata;
  pathGenerator: GeoPath;
  projection: GeoProjection;
}

interface BuildOutlyingTerritoryMapPathParams {
  config: OutlyingTerritoryConfig;
  fallbackMapPath: BuiltOutlyingTerritoryMapPath | null;
  feature: CountryFeature | null;
  metadata: ResolvedOutlyingTerritoryMetadata;
  pathGenerator: GeoPath;
  pathResolution: "highResolution" | "lowResolution";
  projection: GeoProjection;
}

interface FindRestCountryByCodeParams {
  code: string;
  restCountries: readonly RestCountry[];
}

interface CreateOutlyingTerritoryFeatureParams {
  config: OutlyingTerritoryConfig;
  pathResolution: "highResolution" | "lowResolution";
  sourceFeature: CountryFeature | null;
}

interface CreateMissingOutlyingTerritoryMetadataErrorParams {
  code: string;
  metadataRole: "owner country" | "source country" | "territory";
}

interface CreateMissingOutlyingTerritorySourceFeatureErrorParams {
  config: OutlyingTerritoryConfig;
  metadata: ResolvedOutlyingTerritoryMetadata;
  pathResolution: "highResolution" | "lowResolution";
}

interface CreateMissingOutlyingTerritoryMapPathErrorParams {
  config: OutlyingTerritoryConfig;
  metadata: ResolvedOutlyingTerritoryMetadata;
  pathResolution: "highResolution" | "lowResolution";
}

interface BuiltOutlyingTerritoryMapPath {
  bounds: OutlyingTerritory["map"]["bounds"];
  path: string;
}

interface ResolvedOutlyingTerritoryMetadata {
  code: string;
  continent: OutlyingTerritory["continent"];
  displayName: string;
  name: OutlyingTerritory["name"];
  regions: OutlyingTerritory["regions"];
}

interface ResolveOutlyingTerritoryMetadataParams {
  config: OutlyingTerritoryConfig;
  restCountries: readonly RestCountry[];
}

function findRestCountryByCode({
  code,
  restCountries,
}: FindRestCountryByCodeParams): RestCountry | null {
  return restCountries.find((restCountry) => restCountry.cca2 === code) ?? null;
}

function createMissingOutlyingTerritoryMetadataError({
  code,
  metadataRole,
}: CreateMissingOutlyingTerritoryMetadataErrorParams): Error {
  return new Error(
    `Missing RestCountries metadata for outlying territory ${metadataRole} ${code}`,
  );
}

function createMissingOutlyingTerritorySourceFeatureError({
  config,
  metadata,
  pathResolution,
}: CreateMissingOutlyingTerritorySourceFeatureErrorParams): Error {
  return new Error(
    `Missing ${pathResolution} source geometry for outlying territory ${config.code} (${metadata.displayName}) owned by ${config.countryCode} using source ${config.sourceCountryCode}. Check configured source bounds.`,
  );
}

function createMissingOutlyingTerritoryMapPathError({
  config,
  metadata,
  pathResolution,
}: CreateMissingOutlyingTerritoryMapPathErrorParams): Error {
  return new Error(
    `Unable to build ${pathResolution} map path for outlying territory ${config.code} (${metadata.displayName}) owned by ${config.countryCode} using source ${config.sourceCountryCode}.`,
  );
}

function createOutlyingTerritoryFeature({
  config,
  pathResolution,
  sourceFeature,
}: CreateOutlyingTerritoryFeatureParams): CountryFeature | null {
  return extractSourceFeatureParts({
    boundsList: config.sourceBoundsList,
    code: `${config.code}:${pathResolution}`,
    feature: sourceFeature,
    sourceName: config.sourceCountryCode,
  });
}

function buildOutlyingTerritoryMapPath({
  config,
  fallbackMapPath,
  feature,
  metadata,
  pathGenerator,
  pathResolution,
  projection,
}: BuildOutlyingTerritoryMapPathParams): BuiltOutlyingTerritoryMapPath {
  if (feature === null) {
    if (fallbackMapPath !== null) {
      return fallbackMapPath;
    }

    throw createMissingOutlyingTerritorySourceFeatureError({
      config,
      metadata,
      pathResolution,
    });
  }

  const path = pathGenerator(feature);

  if (path === null) {
    if (fallbackMapPath !== null) {
      return fallbackMapPath;
    }

    throw createMissingOutlyingTerritoryMapPathError({
      config,
      metadata,
      pathResolution,
    });
  }

  return applyAntimeridianDisplayWrap({
    code: config.code,
    mapPath: {
      bounds: toMapBounds(pathGenerator.bounds(feature)),
      path,
    },
    projection,
  });
}

function buildOutlyingTerritoryMap({
  config,
  highResolutionSourceFeature,
  lowResolutionSourceFeature,
  metadata,
  pathGenerator,
  projection,
}: BuildOutlyingTerritoryMapParams): OutlyingTerritory["map"] {
  const highResolutionFeature = createOutlyingTerritoryFeature({
    config,
    pathResolution: "highResolution",
    sourceFeature: highResolutionSourceFeature,
  });
  const lowResolutionFeature = createOutlyingTerritoryFeature({
    config,
    pathResolution: "lowResolution",
    sourceFeature: lowResolutionSourceFeature,
  });
  const highResolutionMapPath = buildOutlyingTerritoryMapPath({
    config,
    fallbackMapPath: null,
    feature: highResolutionFeature,
    metadata,
    pathGenerator,
    pathResolution: "highResolution",
    projection,
  });
  const lowResolutionMapPath = buildOutlyingTerritoryMapPath({
    config,
    fallbackMapPath: highResolutionMapPath,
    feature: lowResolutionFeature,
    metadata,
    pathGenerator,
    pathResolution: "lowResolution",
    projection,
  });

  return {
    bounds: highResolutionMapPath.bounds,
    paths: {
      highResolution: highResolutionMapPath.path,
      lowResolution: lowResolutionMapPath.path,
    },
  };
}

function resolveOutlyingTerritoryMetadata({
  config,
  restCountries,
}: ResolveOutlyingTerritoryMetadataParams): ResolvedOutlyingTerritoryMetadata {
  if (config.metadata.type === "appDefined") {
    return {
      code: config.code,
      continent: config.metadata.continent,
      displayName: config.metadata.name.en,
      name: config.metadata.name,
      regions: config.metadata.regions,
    };
  }

  const territoryCountry = findRestCountryByCode({
    code: config.code,
    restCountries,
  });

  if (territoryCountry === null) {
    throw createMissingOutlyingTerritoryMetadataError({
      code: config.code,
      metadataRole: "territory",
    });
  }

  const continent = toContinent(territoryCountry);

  if (continent === null) {
    throw new Error(
      `Missing continent for outlying territory ${config.code} (${territoryCountry.name.common})`,
    );
  }

  return {
    code: territoryCountry.cca2,
    continent,
    displayName: territoryCountry.name.common,
    name: toLocalizedCountryName(territoryCountry),
    regions: toMapRegions(territoryCountry, continent),
  };
}

function buildOutlyingTerritory({
  config,
  highResolutionFeatureLookup,
  lowResolutionFeatureLookup,
  pathGenerator,
  projection,
  restCountries,
}: BuildOutlyingTerritoryParams): OutlyingTerritory {
  const hasOwnerCountryMetadata =
    findRestCountryByCode({
      code: config.countryCode,
      restCountries,
    }) !== null;

  if (!hasOwnerCountryMetadata) {
    throw createMissingOutlyingTerritoryMetadataError({
      code: config.countryCode,
      metadataRole: "owner country",
    });
  }

  const sourceCountry = findRestCountryByCode({
    code: config.sourceCountryCode,
    restCountries,
  });

  if (sourceCountry === null) {
    throw createMissingOutlyingTerritoryMetadataError({
      code: config.sourceCountryCode,
      metadataRole: "source country",
    });
  }

  const metadata = resolveOutlyingTerritoryMetadata({
    config,
    restCountries,
  });

  return {
    code: metadata.code,
    continent: metadata.continent,
    countryCode: config.countryCode,
    map: buildOutlyingTerritoryMap({
      config,
      highResolutionSourceFeature: findCountryFeature({
        featureLookup: highResolutionFeatureLookup,
        restCountry: sourceCountry,
      }),
      lowResolutionSourceFeature: findCountryFeature({
        featureLookup: lowResolutionFeatureLookup,
        restCountry: sourceCountry,
      }),
      metadata,
      pathGenerator,
      projection,
    }),
    name: metadata.name,
    regions: metadata.regions,
  };
}

export function buildOutlyingTerritories({
  highResolutionFeatureLookup,
  lowResolutionFeatureLookup,
  pathGenerator,
  projection,
  restCountries,
}: BuildOutlyingTerritoriesParams): readonly OutlyingTerritory[] {
  return OUTLYING_TERRITORY_CONFIGS.map((config) =>
    buildOutlyingTerritory({
      config,
      highResolutionFeatureLookup,
      lowResolutionFeatureLookup,
      pathGenerator,
      projection,
      restCountries,
    }),
  ).toSorted((left, right) => left.code.localeCompare(right.code));
}
