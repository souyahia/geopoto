import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { MapRegionName } from "../../src/map-definition.ts";
import type { RestCountriesTranslationConfig } from "./types.ts";

const CURRENT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

export const PACKAGE_DIRECTORY = resolve(CURRENT_DIRECTORY, "../..");
export const CUSTOM_FLAGS_DIRECTORY = resolve(
  PACKAGE_DIRECTORY,
  "assets/custom-flags",
);
export const GENERATED_DIRECTORY = resolve(PACKAGE_DIRECTORY, "generated");
export const GENERATED_FLAGS_DIRECTORY = resolve(GENERATED_DIRECTORY, "flags");
export const GENERATED_FLAG_PNGS_DIRECTORY = resolve(
  GENERATED_DIRECTORY,
  "flags-png",
);
export const GENERATED_FLAG_THUMBNAIL_PNGS_DIRECTORY = resolve(
  GENERATED_DIRECTORY,
  "flags-png-thumbnail",
);
export const GENERATED_LOW_RESOLUTION_FLAG_PNGS_DIRECTORY = resolve(
  GENERATED_DIRECTORY,
  "flags-png-low",
);
export const FLAG_PNG_MAX_SIZE = 900;
export const FLAG_COLOR_SAMPLE_MAX_SIZE = 512;
export const FLAG_THUMBNAIL_PNG_MAX_SIZE = 120;
export const FLAG_THUMBNAIL_PNG_SCALES = [1, 2, 3] as const;
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

export const MAP_REGION_PADDING_RATIO = 0.015;

/**
 * A single region-bounds edge override. `countryCode` uses the matching edge of
 * that country's bounds; `latitude` is projected to a map Y coordinate (valid
 * only for the `minY`/`maxY` edges) and is used to crop a far-flung sub-antarctic
 * island that lives inside a country's own geometry, where no country sits at the
 * right latitude to anchor to.
 */
export type MapRegionEdgeAnchor =
  | { countryCode: string }
  | { latitude: number };

export interface MapRegionBoundsAnchors {
  minX?: MapRegionEdgeAnchor;
  maxX?: MapRegionEdgeAnchor;
  minY?: MapRegionEdgeAnchor;
  maxY?: MapRegionEdgeAnchor;
}

/**
 * Curated per-edge anchors for a continent's initial-view bounds.
 *
 * A region's navigation bounds default to the padded union of its member
 * countries (outlying territories never affect a continent's framing, see
 * `buildMapRegions`). For most continents that union frames the region well, but
 * a few include member countries that sprawl far beyond the region's core
 * (transcontinental Russia, Canada's high Arctic), which makes the box so
 * tall/wide that the initial camera zooms far out to fit it and wastes most of a
 * landscape screen. These bounds only drive the initial camera framing
 * (membership, quiz pools, answer validation, and filtering all rely on
 * `country.regions`, never on these bounds), so we override individual edges
 * with the corresponding edge of an anchor country's bounds. A missing edge
 * falls back to the member-country union.
 *
 * - Europe is framed from Iceland (west) to Ukraine (east), north edge at
 *   Iceland and south edge at Greece (Gavdos, the southernmost point of mainland
 *   Europe). This crops the Scandinavian tail in the north, Russia's eastern
 *   span, and Spain's Canary Islands in the south.
 * - North America keeps its north edge at the northern coast of the United
 *   States (Alaska), which crops the empty Canadian Arctic archipelago above it
 *   while keeping mainland Canada, Mexico, and Central America.
 * - Africa's south edge is capped just below Cape Agulhas, cropping South
 *   Africa's Prince Edward Islands (Marion Island, ~47S) that otherwise leave a
 *   wide band of empty ocean below the continent.
 * - Oceania's south edge is capped below New Zealand's Stewart Island, cropping
 *   Australia's Macquarie Island and New Zealand's sub-antarctic islands (~52-55S)
 *   while keeping Tasmania and all of New Zealand's main islands.
 *
 * The result is a wide rectangle that fills a landscape viewport instead of a
 * near-square that letterboxes it.
 */
export const MAP_REGION_BOUNDS_ANCHORS: Partial<
  Record<MapRegionName, MapRegionBoundsAnchors>
> = {
  europe: {
    minX: { countryCode: "IS" },
    maxX: { countryCode: "UA" },
    minY: { countryCode: "IS" },
    maxY: { countryCode: "GR" },
  },
  "north-america": {
    minY: { countryCode: "US" },
  },
  africa: {
    maxY: { latitude: -35 },
  },
  oceania: {
    maxY: { latitude: -47.5 },
  },
};
