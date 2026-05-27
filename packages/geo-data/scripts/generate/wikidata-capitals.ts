import * as z from "zod";

import {
  SUPPORTED_GEO_LANGUAGES,
  type LocalizedText,
} from "../../src/geo-language.ts";
import { parseWithSchema } from "./validation.ts";

const WIKIDATA_SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const WIKIDATA_ENTITY_API_ENDPOINT = "https://www.wikidata.org/w/api.php";
const WIKIDATA_ENTITY_LABEL_CHUNK_SIZE = 50;
const WIKIDATA_USER_AGENT = "geopoto-geo-data-generator/1.0";

const SPARQL_BINDING_VALUE_SCHEMA = z.object({
  value: z.string(),
});

const WIKIDATA_CAPITAL_BINDING_SCHEMA = z.object({
  capital: SPARQL_BINDING_VALUE_SCHEMA.optional(),
  iso2: SPARQL_BINDING_VALUE_SCHEMA,
});

const WIKIDATA_CAPITAL_RESPONSE_SCHEMA = z.object({
  results: z.object({
    bindings: z.array(WIKIDATA_CAPITAL_BINDING_SCHEMA),
  }),
});

const WIKIDATA_LABEL_SCHEMA = z.object({
  value: z.string(),
});

const WIKIDATA_ENTITY_SCHEMA = z.object({
  labels: z.record(z.string(), WIKIDATA_LABEL_SCHEMA).optional(),
});

const WIKIDATA_ENTITY_LABEL_RESPONSE_SCHEMA = z.object({
  entities: z.record(z.string(), WIKIDATA_ENTITY_SCHEMA),
});

type WikidataEntity = z.output<typeof WIKIDATA_ENTITY_SCHEMA>;

export interface WikidataCapitalLabels {
  id: string;
  labels: Partial<LocalizedText>;
}

export type WikidataCapitalLabelsByCountryCode = ReadonlyMap<
  string,
  readonly WikidataCapitalLabels[]
>;

interface LoadWikidataCapitalLabelsByCountryCodeParams {
  countryCodes: readonly string[];
}

interface WikidataCapitalReference {
  capitalEntityId: string;
  countryCode: string;
}

interface LoadWikidataEntityLabelsParams {
  entityIds: readonly string[];
}

interface FetchWikidataJsonParams {
  url: string;
}

interface BuildWikidataCapitalQueryParams {
  countryCodes: readonly string[];
}

interface BuildWikidataEntityLabelsUrlParams {
  entityIds: readonly string[];
}

interface ToSparqlStringLiteralParams {
  value: string;
}

interface ToWikidataEntityIdParams {
  uri: string;
}

interface ToSupportedLabelsParams {
  entity: WikidataEntity;
}

interface ToCapitalLabelsByCountryCodeParams {
  capitalReferences: readonly WikidataCapitalReference[];
  labelsByCapitalEntityId: ReadonlyMap<string, Partial<LocalizedText>>;
}

interface ChunkItemsParams<TItem> {
  items: readonly TItem[];
  size: number;
}

export async function loadWikidataCapitalLabelsByCountryCode({
  countryCodes,
}: LoadWikidataCapitalLabelsByCountryCodeParams): Promise<WikidataCapitalLabelsByCountryCode> {
  const capitalReferences = await loadWikidataCapitalReferences({
    countryCodes,
  });
  const capitalEntityIds = getUniqueValues(
    capitalReferences.map((reference) => reference.capitalEntityId),
  );
  const labelsByCapitalEntityId = await loadWikidataEntityLabels({
    entityIds: capitalEntityIds,
  });

  return toCapitalLabelsByCountryCode({
    capitalReferences,
    labelsByCapitalEntityId,
  });
}

async function loadWikidataCapitalReferences({
  countryCodes,
}: LoadWikidataCapitalLabelsByCountryCodeParams): Promise<
  readonly WikidataCapitalReference[]
> {
  if (countryCodes.length === 0) {
    return [];
  }

  const url = new URL(WIKIDATA_SPARQL_ENDPOINT);
  url.searchParams.set("format", "json");
  url.searchParams.set("query", buildWikidataCapitalQuery({ countryCodes }));

  const response = parseWithSchema({
    schema: WIKIDATA_CAPITAL_RESPONSE_SCHEMA,
    source: "Wikidata capital",
    value: await fetchWikidataJson({ url: url.toString() }),
  });

  return response.results.bindings.flatMap((binding) => {
    const capitalUri = binding.capital?.value;

    if (capitalUri === undefined) {
      return [];
    }

    return [
      {
        capitalEntityId: toWikidataEntityId({ uri: capitalUri }),
        countryCode: binding.iso2.value,
      },
    ];
  });
}

async function loadWikidataEntityLabels({
  entityIds,
}: LoadWikidataEntityLabelsParams): Promise<
  ReadonlyMap<string, Partial<LocalizedText>>
> {
  const labelsByEntityId = new Map<string, Partial<LocalizedText>>();
  const responseChunks = await Promise.all(
    chunkItems({
      items: entityIds,
      size: WIKIDATA_ENTITY_LABEL_CHUNK_SIZE,
    }).map((entityIdChunk) =>
      fetchWikidataJson({
        url: buildWikidataEntityLabelsUrl({ entityIds: entityIdChunk }),
      }),
    ),
  );

  for (const responseChunk of responseChunks) {
    const response = parseWithSchema({
      schema: WIKIDATA_ENTITY_LABEL_RESPONSE_SCHEMA,
      source: "Wikidata entity label",
      value: responseChunk,
    });

    for (const [entityId, entity] of Object.entries(response.entities)) {
      labelsByEntityId.set(entityId, toSupportedLabels({ entity }));
    }
  }

  return labelsByEntityId;
}

async function fetchWikidataJson({
  url,
}: FetchWikidataJsonParams): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": WIKIDATA_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function buildWikidataCapitalQuery({
  countryCodes,
}: BuildWikidataCapitalQueryParams): string {
  const countryCodeValues = getUniqueValues(countryCodes)
    .map((countryCode) => toSparqlStringLiteral({ value: countryCode }))
    .join(" ");

  return `
SELECT ?iso2 ?capital WHERE {
  VALUES ?iso2 { ${countryCodeValues} }
  ?country wdt:P297 ?iso2.
  OPTIONAL { ?country wdt:P36 ?capital. }
}
ORDER BY ?iso2 ?capital
`;
}

function buildWikidataEntityLabelsUrl({
  entityIds,
}: BuildWikidataEntityLabelsUrlParams): string {
  const searchParams = new URLSearchParams({
    action: "wbgetentities",
    format: "json",
    ids: entityIds.join("|"),
    languages: SUPPORTED_GEO_LANGUAGES.join("|"),
    props: "labels",
  });

  return `${WIKIDATA_ENTITY_API_ENDPOINT}?${searchParams.toString()}`;
}

function toSparqlStringLiteral({ value }: ToSparqlStringLiteralParams): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function toWikidataEntityId({ uri }: ToWikidataEntityIdParams): string {
  const marker = "/entity/";
  const markerIndex = uri.lastIndexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Invalid Wikidata entity URI: ${uri}`);
  }

  return uri.slice(markerIndex + marker.length);
}

function toSupportedLabels({
  entity,
}: ToSupportedLabelsParams): Partial<LocalizedText> {
  return SUPPORTED_GEO_LANGUAGES.reduce<Partial<LocalizedText>>(
    (labels, language) => {
      const label = entity.labels?.[language]?.value;

      if (label === undefined) {
        return labels;
      }

      return {
        ...labels,
        [language]: label,
      };
    },
    {},
  );
}

function toCapitalLabelsByCountryCode({
  capitalReferences,
  labelsByCapitalEntityId,
}: ToCapitalLabelsByCountryCodeParams): WikidataCapitalLabelsByCountryCode {
  const capitalsByCountryCode = new Map<string, WikidataCapitalLabels[]>();

  for (const reference of capitalReferences) {
    const labels = labelsByCapitalEntityId.get(reference.capitalEntityId);

    if (labels === undefined) {
      throw new Error(
        `Missing Wikidata labels for capital ${reference.capitalEntityId}`,
      );
    }

    const previousCapitals =
      capitalsByCountryCode.get(reference.countryCode) ?? [];

    capitalsByCountryCode.set(reference.countryCode, [
      ...previousCapitals,
      {
        id: reference.capitalEntityId,
        labels,
      },
    ]);
  }

  return new Map(
    [...capitalsByCountryCode.entries()].map(([countryCode, capitals]) => [
      countryCode,
      capitals.toSorted((left, right) => left.id.localeCompare(right.id)),
    ]),
  );
}

function chunkItems<TItem>({
  items,
  size,
}: ChunkItemsParams<TItem>): readonly (readonly TItem[])[] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

function getUniqueValues(values: readonly string[]): readonly string[] {
  return [...new Set(values)].toSorted();
}
