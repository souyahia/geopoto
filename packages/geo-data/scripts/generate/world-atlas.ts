import type { Geometry } from "geojson";
import { feature as toGeoJsonFeature } from "topojson-client";
import worldAtlasTopologyData from "world-atlas/countries-50m.json" with { type: "json" };
import * as z from "zod";

import { normalizeCountryName } from "./country.ts";
import type { CountryFeature, WorldAtlasTopology } from "./types.ts";
import { parseWithSchema } from "./validation.ts";

const GEOJSON_GEOMETRY_SCHEMA = z.custom<Geometry>(
  (value) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }

    return "type" in value && typeof value.type === "string";
  },
  {
    message: "Expected GeoJSON geometry",
  },
);

const RAW_GEOMETRY_PROPERTIES_SCHEMA = z.object({
  name: z.string().optional(),
});

const COUNTRY_FEATURE_SCHEMA = z
  .object({
    geometry: GEOJSON_GEOMETRY_SCHEMA,
    id: z.union([z.number(), z.string()]).optional(),
    properties: RAW_GEOMETRY_PROPERTIES_SCHEMA,
    type: z.literal("Feature"),
  })
  .loose();

const COUNTRY_FEATURE_COLLECTION_SCHEMA = z
  .object({
    features: z.array(COUNTRY_FEATURE_SCHEMA),
    type: z.literal("FeatureCollection"),
  })
  .loose();

const MINIMAL_WORLD_ATLAS_TOPOLOGY_SCHEMA = z
  .object({
    arcs: z.array(z.unknown()),
    objects: z.object({
      countries: z
        .object({
          geometries: z.array(z.unknown()),
          type: z.literal("GeometryCollection"),
        })
        .loose(),
    }),
    type: z.literal("Topology"),
  })
  .loose();

const WORLD_ATLAS_TOPOLOGY_SCHEMA = z.custom<WorldAtlasTopology>(
  (value) => {
    const result = MINIMAL_WORLD_ATLAS_TOPOLOGY_SCHEMA.safeParse(value);

    return result.success;
  },
  {
    message: "Expected world-atlas countries to be a topology",
  },
);

export function toCountryFeatures(
  topology: WorldAtlasTopology,
): readonly CountryFeature[] {
  const collection = toGeoJsonFeature(topology, topology.objects.countries);

  return parseWithSchema({
    schema: COUNTRY_FEATURE_COLLECTION_SCHEMA,
    source: "converted world-atlas countries",
    value: collection,
  }).features;
}

export function createFeatureByNumericId(
  features: readonly CountryFeature[],
): ReadonlyMap<string, CountryFeature> {
  return new Map(
    features.flatMap((countryFeature) => {
      const id = countryFeature.id;

      if (id === undefined) {
        return [];
      }

      return [[String(id).padStart(3, "0"), countryFeature]];
    }),
  );
}

export function createFeatureByName(
  features: readonly CountryFeature[],
): ReadonlyMap<string, CountryFeature> {
  return new Map(
    features.flatMap((countryFeature) => {
      const name = countryFeature.properties.name;

      if (name === undefined) {
        return [];
      }

      return [[normalizeCountryName(name), countryFeature]];
    }),
  );
}

export function loadWorldAtlasTopology(): WorldAtlasTopology {
  return parseWithSchema({
    schema: WORLD_ATLAS_TOPOLOGY_SCHEMA,
    source: "world-atlas",
    value: worldAtlasTopologyData,
  });
}
