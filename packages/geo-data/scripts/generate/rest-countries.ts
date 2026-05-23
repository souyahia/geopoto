import * as z from "zod";

import { REST_COUNTRIES_URL } from "./config.ts";
import { fetchJson } from "./json.ts";
import { parseWithSchema } from "./validation.ts";

const COUNTRY_NAME_SCHEMA = z.object({
  common: z.string(),
});

const OPTIONAL_STRING_SCHEMA = z
  .string()
  .nullish()
  .transform((value) => value ?? null);

const OPTIONAL_BOOLEAN_SCHEMA = z
  .boolean()
  .nullish()
  .transform((value) => value ?? null);

const GEO_COORDINATES_SCHEMA = z
  .tuple([z.number(), z.number()])
  .nullish()
  .transform((value) => value ?? null);

const REST_COUNTRY_SCHEMA = z.object({
  capital: z.array(z.string()),
  cca2: z.string(),
  ccn3: OPTIONAL_STRING_SCHEMA,
  independent: OPTIONAL_BOOLEAN_SCHEMA,
  latlng: GEO_COORDINATES_SCHEMA,
  name: COUNTRY_NAME_SCHEMA,
  region: z.string(),
  subregion: OPTIONAL_STRING_SCHEMA,
  translations: z.record(z.string(), COUNTRY_NAME_SCHEMA),
  unMember: z.boolean(),
});

const REST_COUNTRIES_SCHEMA = z.array(REST_COUNTRY_SCHEMA);

export type RestCountry = z.infer<typeof REST_COUNTRY_SCHEMA>;

// Also include Palestine because FREE PALESTINE <3
const ADDITIONAL_INCLUDED_COUNTRY_CODES: readonly string[] = ["EH", "PS"];

function shouldIncludeCountry(country: RestCountry): boolean {
  const isRecognizedCountry = country.independent === true || country.unMember;

  if (isRecognizedCountry) {
    return true;
  }

  return ADDITIONAL_INCLUDED_COUNTRY_CODES.includes(country.cca2);
}

export function filterIncludedRestCountries(
  restCountries: readonly RestCountry[],
): readonly RestCountry[] {
  return restCountries.filter(shouldIncludeCountry);
}

export async function loadRestCountryRecords(): Promise<
  readonly RestCountry[]
> {
  const restCountries = await fetchJson(REST_COUNTRIES_URL);
  return parseWithSchema({
    schema: REST_COUNTRIES_SCHEMA,
    source: "RestCountries",
    value: restCountries,
  });
}

export async function loadRestCountries(): Promise<readonly RestCountry[]> {
  return filterIncludedRestCountries(await loadRestCountryRecords());
}
