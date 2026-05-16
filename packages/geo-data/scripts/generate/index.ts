import { mkdir, rm } from "node:fs/promises";

import { geoEqualEarth, geoPath } from "d3-geo";

import {
  GENERATED_DIRECTORY,
  GENERATED_FLAG_PNGS_DIRECTORY,
  GENERATED_FLAGS_DIRECTORY,
} from "./config.ts";
import { buildCountry } from "./country.ts";
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
import {
  createFeatureByName,
  createFeatureByNumericId,
  loadWorldAtlasTopology,
  toCountryFeatures,
} from "./world-atlas.ts";

async function generateGeoData(): Promise<void> {
  const [restCountries, topology] = await Promise.all([
    loadRestCountries(),
    loadWorldAtlasTopology(),
  ]);
  const features = toCountryFeatures(topology);
  const featureByNumericId = createFeatureByNumericId(features);
  const featureByName = createFeatureByName(features);
  const projection = geoEqualEarth().fitSize([1000, 500], { type: "Sphere" });
  const pathGenerator = geoPath(projection).digits(3);
  const countries = restCountries
    .map((restCountry) =>
      buildCountry({
        featureByName,
        featureByNumericId,
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
