import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface GeneratedJsonFile {
  data: unknown;
  path: string;
}

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDirectory = resolve(packageDirectory, "generated");

const generatedJsonFiles: readonly GeneratedJsonFile[] = [
  {
    data: [],
    path: resolve(generatedDirectory, "countries.json"),
  },
  {
    data: [],
    path: resolve(generatedDirectory, "map-regions.json"),
  },
];

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function formatJson(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

async function writeJsonFile(file: GeneratedJsonFile): Promise<void> {
  await writeFile(file.path, formatJson(file.data), "utf8");
}

async function generateGeoData(): Promise<void> {
  await mkdir(generatedDirectory, { recursive: true });
  await Promise.all(generatedJsonFiles.map((file) => writeJsonFile(file)));
}

generateGeoData().catch((error: unknown) => {
  console.error(formatUnknownError(error));
  process.exitCode = 1;
});
