import type { Feature, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";

import type { LocalizedText } from "../../src/geo-language.ts";

export interface GeneratedJsonFile {
  data: unknown;
  path: string;
}

export interface RawGeometryProperties {
  name?: string;
}

export interface RestCountriesTranslationConfig {
  language: keyof LocalizedText;
  restCountriesCode: string | null;
}

export type WorldAtlasTopology = Topology<{
  countries: GeometryCollection<RawGeometryProperties>;
}>;

export type CountryFeature = Feature<Geometry, RawGeometryProperties> & {
  id?: number | string;
};
