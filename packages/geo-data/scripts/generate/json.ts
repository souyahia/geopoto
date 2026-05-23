import { writeFile } from "node:fs/promises";

import type {
  GeneratedBinaryFile,
  GeneratedJsonFile,
  GeneratedTextFile,
} from "./types.ts";

const REGIONS_ARRAY_REGEX = /"regions": \[\n((?:\s+"[^"]+",?\n)+)\s+\]/g;
const JSON_STRING_REGEX = /"[^"]+"/g;

export function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function formatJson(data: unknown): string {
  return `${compactRegionsArrays(JSON.stringify(data, null, 2))}\n`;
}

function compactRegionsArrays(json: string): string {
  return json.replace(REGIONS_ARRAY_REGEX, (_, rawItems: string) => {
    const items = Array.from(rawItems.matchAll(JSON_STRING_REGEX)).map(
      ([item]) => item,
    );

    return `"regions": [${items.join(", ")}]`;
  });
}

export async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function writeJsonFile(file: GeneratedJsonFile): Promise<void> {
  await writeFile(file.path, formatJson(file.data), "utf8");
}

export async function writeBinaryFile(
  file: GeneratedBinaryFile,
): Promise<void> {
  await writeFile(file.path, file.content);
}

export async function writeTextFile(file: GeneratedTextFile): Promise<void> {
  await writeFile(file.path, file.content, "utf8");
}
