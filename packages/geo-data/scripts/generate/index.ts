import { mkdir } from "node:fs/promises";

import { geoEqualEarth, geoPath } from "d3-geo";

import { GENERATED_DIRECTORY } from "./config.ts";
import { buildCountry } from "./country.ts";
import { buildGeneratedData } from "./generated-files.ts";
import { formatUnknownError, writeJsonFile } from "./json.ts";
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
  const mapRegions = buildMapRegions({ countries });
  const generatedJsonFiles = buildGeneratedData({ countries, mapRegions });

  await mkdir(GENERATED_DIRECTORY, { recursive: true });
  await Promise.all(generatedJsonFiles.map((file) => writeJsonFile(file)));
}

generateGeoData().catch((error: unknown) => {
  console.error(formatUnknownError(error));
  process.exitCode = 1;
});
