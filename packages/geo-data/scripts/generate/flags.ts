import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import { Resvg } from "@resvg/resvg-js";

import type { Country } from "../../src/countries.ts";
import {
  FLAG_PNG_MAX_SIZE,
  GENERATED_FLAG_PNGS_DIRECTORY,
  GENERATED_FLAGS_DIRECTORY,
} from "./config.ts";
import type { GeneratedBinaryFile, GeneratedTextFile } from "./types.ts";

interface GeneratedCountryFlag {
  aspectRatio: number;
  code: string;
  png: FlagDimensions;
  svg: SvgMetadata;
}

interface GeneratedFlagArtifacts {
  flags: Readonly<Record<string, GeneratedCountryFlag>>;
  pngFiles: readonly GeneratedBinaryFile[];
  svgFiles: readonly GeneratedTextFile[];
}

interface FlagDimensions {
  height: number;
  width: number;
}

interface SvgMetadata extends FlagDimensions {
  viewBox: string;
}

interface SvgViewBox {
  height: number;
  value: string;
  width: number;
}

interface BuildCountryFlagsParams {
  countries: readonly Country[];
}

interface BuildCountryFlagParams {
  code: string;
  svg: string;
}

interface RenderFlagPngParams {
  png: FlagDimensions;
  svg: string;
}

const require = createRequire(import.meta.url);
const FLAG_SOURCE_PACKAGE_DIRECTORY = dirname(
  require.resolve("svg-country-flags/package.json"),
);
const FLAG_SOURCE_DIRECTORY = resolve(FLAG_SOURCE_PACKAGE_DIRECTORY, "svg");
const VIEW_BOX_REGEX = /\sviewBox="([^"]+)"/u;

function toFlagFileName(code: string): string {
  return `${code.toLowerCase()}.svg`;
}

function toFlagPngFileName(code: string): string {
  return `${code.toLowerCase()}.png`;
}

function toFlagSourcePath(code: string): string {
  return resolve(FLAG_SOURCE_DIRECTORY, toFlagFileName(code));
}

function toGeneratedFlagPath(code: string): string {
  return resolve(GENERATED_FLAGS_DIRECTORY, toFlagFileName(code));
}

function toGeneratedFlagPngPath(code: string): string {
  return resolve(GENERATED_FLAG_PNGS_DIRECTORY, toFlagPngFileName(code));
}

function parseSvgViewBox(svg: string): SvgViewBox {
  const viewBoxMatch = VIEW_BOX_REGEX.exec(svg);
  const viewBox = viewBoxMatch?.[1];

  if (viewBox === undefined) {
    throw new Error("Missing SVG viewBox");
  }

  const values = viewBox
    .trim()
    .split(/[\s,]+/u)
    .map(Number);
  const width = values[2];
  const height = values[3];
  const hasInvalidValue = values.some((value) => !Number.isFinite(value));

  if (
    values.length !== 4 ||
    width === undefined ||
    height === undefined ||
    width <= 0 ||
    height <= 0 ||
    hasInvalidValue
  ) {
    throw new Error(`Invalid SVG viewBox: ${viewBox}`);
  }

  return {
    height,
    value: viewBox,
    width,
  };
}

function toPngDimensions(viewBox: SvgViewBox): FlagDimensions {
  const scale = FLAG_PNG_MAX_SIZE / Math.max(viewBox.width, viewBox.height);

  return {
    height: Math.max(1, Math.round(viewBox.height * scale)),
    width: Math.max(1, Math.round(viewBox.width * scale)),
  };
}

function renderFlagPng({ png, svg }: RenderFlagPngParams): Buffer {
  const fitTo =
    png.width >= png.height
      ? { mode: "width" as const, value: png.width }
      : { mode: "height" as const, value: png.height };

  return new Resvg(svg, { fitTo }).render().asPng();
}

function buildCountryFlag({
  code,
  svg,
}: BuildCountryFlagParams): GeneratedCountryFlag {
  const viewBox = parseSvgViewBox(svg);
  const png = toPngDimensions(viewBox);

  return {
    aspectRatio: viewBox.width / viewBox.height,
    code,
    png,
    svg: {
      height: viewBox.height,
      viewBox: viewBox.value,
      width: viewBox.width,
    },
  };
}

export async function buildCountryFlags({
  countries,
}: BuildCountryFlagsParams): Promise<GeneratedFlagArtifacts> {
  const countryFlagAssets = await Promise.all(
    countries.map(async (country) => {
      const sourcePath = toFlagSourcePath(country.code);
      const svg = await readFile(sourcePath, "utf8").catch((error: unknown) => {
        throw new Error(`Missing flag for ${country.code} at ${sourcePath}`, {
          cause: error,
        });
      });
      const flag = buildCountryFlag({
        code: country.code,
        svg,
      });

      return {
        flag,
        png: renderFlagPng({
          png: flag.png,
          svg,
        }),
        svg,
      };
    }),
  );
  const countryFlags = countryFlagAssets.map(({ flag }) => flag);
  const flags = Object.fromEntries(
    countryFlags.map((flag) => [flag.code, flag]),
  );
  const pngFiles = countryFlagAssets.map(({ flag, png }) => ({
    content: png,
    path: toGeneratedFlagPngPath(flag.code),
  }));
  const svgFiles = countryFlagAssets.map(({ flag, svg }) => ({
    content: svg,
    path: toGeneratedFlagPath(flag.code),
  }));

  return {
    flags,
    pngFiles,
    svgFiles,
  };
}
