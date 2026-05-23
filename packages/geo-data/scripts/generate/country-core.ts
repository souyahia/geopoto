import { getOutlyingTerritorySourceBounds } from "./outlying-territory-config.ts";
import {
  excludeSourceFeatureParts,
  type GeographicBounds,
} from "./source-feature-parts.ts";
import type { CountryFeature } from "./types.ts";

interface BuildCountryCoreFeatureParams {
  countryCode: string;
  feature: CountryFeature | null;
}

interface CountryCoreExclusionConfig {
  sourceBoundsList: readonly GeographicBounds[];
}

const COUNTRY_CORE_EXCLUSION_CONFIGS_BY_CODE = new Map<
  string,
  CountryCoreExclusionConfig
>([
  [
    "US",
    {
      sourceBoundsList: [
        {
          maxLatitude: 55,
          maxLongitude: -160,
          minLatitude: 51,
          minLongitude: -180,
        },
        {
          maxLatitude: 55,
          maxLongitude: 180,
          minLatitude: 51,
          minLongitude: 172,
        },
      ],
    },
  ],
]);

function getCountryCoreSourceBounds(
  countryCode: string,
): readonly GeographicBounds[] {
  const countryCoreExclusionConfig =
    COUNTRY_CORE_EXCLUSION_CONFIGS_BY_CODE.get(countryCode);

  return [
    ...getOutlyingTerritorySourceBounds(countryCode),
    ...(countryCoreExclusionConfig?.sourceBoundsList ?? []),
  ];
}

export function buildCountryCoreFeature({
  countryCode,
  feature,
}: BuildCountryCoreFeatureParams): CountryFeature | null {
  const countryCoreSourceBounds = getCountryCoreSourceBounds(countryCode);

  if (countryCoreSourceBounds.length === 0) {
    return feature;
  }

  return excludeSourceFeatureParts({
    boundsList: countryCoreSourceBounds,
    feature,
    sourceName: countryCode,
  });
}
