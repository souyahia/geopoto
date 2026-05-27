import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

import { Resvg } from "@resvg/resvg-js";

import type { Country } from "../../src/countries.ts";
import type {
  CountryFlagColor,
  CountryFlagColorCoverage,
} from "../../src/flag-colors.ts";
import {
  FLAG_COLOR_SAMPLE_MAX_SIZE,
  FLAG_PNG_MAX_SIZE,
  GENERATED_FLAG_PNGS_DIRECTORY,
  GENERATED_FLAGS_DIRECTORY,
  GENERATED_LOW_RESOLUTION_FLAG_PNGS_DIRECTORY,
  LOW_RESOLUTION_FLAG_PNG_MAX_SIZE,
  LOW_RESOLUTION_FLAG_PNG_SCALES,
} from "./config.ts";
import { extractCountryFlagColorMetadata } from "./flag-colors.ts";
import type { GeneratedBinaryFile, GeneratedTextFile } from "./types.ts";

interface GeneratedCountryFlag {
  aspectRatio: number;
  code: string;
  colorCoverage: CountryFlagColorCoverage;
  colors: readonly CountryFlagColor[];
  lowResolutionPng: FlagDimensions;
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

interface RenderFlagColorSampleParams {
  dimensions: FlagDimensions;
  svg: string;
}

interface RenderedFlagColorSample extends FlagDimensions {
  pixels: Buffer;
}

interface ScaleFlagDimensionsParams {
  dimensions: FlagDimensions;
  scale: number;
}

interface ToGeneratedLowResolutionFlagPngPathParams {
  code: string;
  scale: number;
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

function toFlagPngFileName(code: string, scale = 1): string {
  const scaleSuffix = scale === 1 ? "" : `@${scale}x`;

  return `${code.toLowerCase()}${scaleSuffix}.png`;
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

function toGeneratedLowResolutionFlagPngPath({
  code,
  scale,
}: ToGeneratedLowResolutionFlagPngPathParams): string {
  return resolve(
    GENERATED_LOW_RESOLUTION_FLAG_PNGS_DIRECTORY,
    toFlagPngFileName(code, scale),
  );
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

function toPngDimensions({
  maxSize,
  viewBox,
}: ToPngDimensionsParams): FlagDimensions {
  const scale = maxSize / Math.max(viewBox.width, viewBox.height);

  return {
    height: Math.max(1, Math.round(viewBox.height * scale)),
    width: Math.max(1, Math.round(viewBox.width * scale)),
  };
}

interface ToPngDimensionsParams {
  maxSize: number;
  viewBox: SvgViewBox;
}

function scaleFlagDimensions({
  dimensions,
  scale,
}: ScaleFlagDimensionsParams): FlagDimensions {
  return {
    height: dimensions.height * scale,
    width: dimensions.width * scale,
  };
}

function renderFlagPng({ png, svg }: RenderFlagPngParams): Buffer {
  const fitTo =
    png.width >= png.height
      ? { mode: "width" as const, value: png.width }
      : { mode: "height" as const, value: png.height };

  return new Resvg(svg, { fitTo }).render().asPng();
}

function renderFlagColorSample({
  dimensions,
  svg,
}: RenderFlagColorSampleParams): RenderedFlagColorSample {
  const fitTo =
    dimensions.width >= dimensions.height
      ? { mode: "width" as const, value: dimensions.width }
      : { mode: "height" as const, value: dimensions.height };
  const renderedImage = new Resvg(svg, { fitTo }).render();

  return {
    height: renderedImage.height,
    pixels: renderedImage.pixels,
    width: renderedImage.width,
  };
}

function buildCountryFlag({
  code,
  svg,
}: BuildCountryFlagParams): GeneratedCountryFlag {
  const viewBox = parseSvgViewBox(svg);
  const png = toPngDimensions({
    maxSize: FLAG_PNG_MAX_SIZE,
    viewBox,
  });
  const lowResolutionPng = toPngDimensions({
    maxSize: LOW_RESOLUTION_FLAG_PNG_MAX_SIZE,
    viewBox,
  });
  const colorSampleDimensions = toPngDimensions({
    maxSize: FLAG_COLOR_SAMPLE_MAX_SIZE,
    viewBox,
  });
  const colorMetadata = extractCountryFlagColorMetadata(
    renderFlagColorSample({
      dimensions: colorSampleDimensions,
      svg,
    }),
  );

  return {
    aspectRatio: viewBox.width / viewBox.height,
    code,
    colorCoverage: colorMetadata.colorCoverage,
    colors: colorMetadata.colors,
    lowResolutionPng,
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
        lowResolutionPngFiles: LOW_RESOLUTION_FLAG_PNG_SCALES.map((scale) => ({
          png: renderFlagPng({
            png: scaleFlagDimensions({
              dimensions: flag.lowResolutionPng,
              scale,
            }),
            svg,
          }),
          scale,
        })),
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
  const lowResolutionPngFiles = countryFlagAssets.flatMap(
    ({ flag, lowResolutionPngFiles }) =>
      lowResolutionPngFiles.map(({ png, scale }) => ({
        content: png,
        path: toGeneratedLowResolutionFlagPngPath({
          code: flag.code,
          scale,
        }),
      })),
  );
  const svgFiles = countryFlagAssets.map(({ flag, svg }) => ({
    content: svg,
    path: toGeneratedFlagPath(flag.code),
  }));

  return {
    flags,
    pngFiles: [...pngFiles, ...lowResolutionPngFiles],
    svgFiles,
  };
}
