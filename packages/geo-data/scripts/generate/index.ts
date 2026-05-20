import { mkdir, rm } from "node:fs/promises";

import { geoMercator, geoPath } from "d3-geo";

import {
  GENERATED_DIRECTORY,
  GENERATED_FLAG_PNGS_DIRECTORY,
  GENERATED_FLAGS_DIRECTORY,
} from "./config.ts";
import { type CountryFeatureLookup, buildCountry } from "./country.ts";
import { buildCountryFlags } from "./flags.ts";
import { buildGeneratedData } from "./generated-files.ts";
import {
  formatUnknownError,
  writeBinaryFile,
  writeJsonFile,
  writeTextFile,
} from "./json.ts";
import { buildMapRegions } from "./map-regions.ts";
import { loadRestCountries } from "./rest-countries.ts";
import type { CountryFeature } from "./types.ts";
import {
  createFeatureByName,
  createFeatureByNumericId,
  loadWorldAtlasTopologies,
  toCountryFeatures,
} from "./world-atlas.ts";

function createCountryFeatureLookup(
  features: readonly CountryFeature[],
): CountryFeatureLookup {
  return {
    byName: createFeatureByName(features),
    byNumericId: createFeatureByNumericId(features),
  };
}

async function generateGeoData(): Promise<void> {
  const [restCountries, topologies] = await Promise.all([
    loadRestCountries(),
    loadWorldAtlasTopologies(),
  ]);
  const highResolutionFeatures = toCountryFeatures(topologies.highResolution);
  const lowResolutionFeatures = toCountryFeatures(topologies.lowResolution);
  const highResolutionFeatureLookup = createCountryFeatureLookup(
    highResolutionFeatures,
  );
  const lowResolutionFeatureLookup = createCountryFeatureLookup(
    lowResolutionFeatures,
  );
  const projection = geoMercator().fitSize([1000, 500], { type: "Sphere" });
  const pathGenerator = geoPath(projection).digits(3);
  const countries = restCountries
    .map((restCountry) =>
      buildCountry({
        highResolutionFeatureLookup,
        lowResolutionFeatureLookup,
        pathGenerator,
        projection,
        restCountry,
      }),
    )
    .filter((country) => country !== null)
    .toSorted((left, right) => left.code.localeCompare(right.code));
  const countryFlags = await buildCountryFlags({ countries });
  const mapRegions = buildMapRegions({ countries });
  const generatedJsonFiles = buildGeneratedData({
    countries,
    countryFlags: countryFlags.flags,
    mapRegions,
  });

  await mkdir(GENERATED_DIRECTORY, { recursive: true });
  await Promise.all([
    rm(GENERATED_FLAGS_DIRECTORY, { force: true, recursive: true }),
    rm(GENERATED_FLAG_PNGS_DIRECTORY, { force: true, recursive: true }),
  ]);
  await Promise.all([
    mkdir(GENERATED_FLAGS_DIRECTORY, { recursive: true }),
    mkdir(GENERATED_FLAG_PNGS_DIRECTORY, { recursive: true }),
  ]);
  await Promise.all([
    ...generatedJsonFiles.map((file) => writeJsonFile(file)),
    ...countryFlags.pngFiles.map((file) => writeBinaryFile(file)),
    ...countryFlags.svgFiles.map((file) => writeTextFile(file)),
  ]);
}

generateGeoData().catch((error: unknown) => {
  console.error(formatUnknownError(error));
  process.exitCode = 1;
});
