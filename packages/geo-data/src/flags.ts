import flagsData from "../generated/flags.json";
import type { CountryFlagColor, CountryFlagColorCoverage } from "./flag-colors";

interface CountryFlagData extends Omit<
  CountryFlag,
  "colorCoverage" | "colors"
> {
  colorCoverage: Partial<Record<string, number>>;
  colors: readonly string[];
}

export interface CountryFlag {
  aspectRatio: number;
  code: string;
  colorCoverage: CountryFlagColorCoverage;
  colors: readonly CountryFlagColor[];
  lowResolutionPng: CountryFlagDimensions;
  png: CountryFlagDimensions;
  svg: CountryFlagSvg;
  thumbnailPng: CountryFlagDimensions;
}

export interface CountryFlagDimensions {
  height: number;
  width: number;
}

export interface CountryFlagSvg extends CountryFlagDimensions {
  viewBox: string;
}

const COUNTRY_FLAGS_DATA = flagsData satisfies Readonly<
  Record<string, CountryFlagData>
>;
const COUNTRY_FLAGS_BY_CODE: Readonly<Record<string, CountryFlag>> =
  Object.fromEntries(
    Object.entries(COUNTRY_FLAGS_DATA).map(([code, flag]) => [
      code,
      toCountryFlag(flag),
    ]),
  );

export const COUNTRY_FLAGS = COUNTRY_FLAGS_BY_CODE;
export const COUNTRY_FLAG_CODES: readonly string[] = Object.keys(
  COUNTRY_FLAGS_BY_CODE,
);

export function getCountryFlag(code: string): CountryFlag | null {
  return COUNTRY_FLAGS_BY_CODE[code.toUpperCase()] ?? null;
}

function toCountryFlag(flag: CountryFlagData): CountryFlag {
  return {
    aspectRatio: flag.aspectRatio,
    code: flag.code,
    colorCoverage: toCountryFlagColorCoverage(flag.colorCoverage),
    colors: flag.colors.map(toCountryFlagColor),
    lowResolutionPng: flag.lowResolutionPng,
    png: flag.png,
    svg: flag.svg,
    thumbnailPng: flag.thumbnailPng,
  };
}

function toCountryFlagColorCoverage(
  colorCoverage: CountryFlagData["colorCoverage"],
): CountryFlagColorCoverage {
  const normalizedColorCoverage: CountryFlagColorCoverage = {};

  for (const [color, coverage] of Object.entries(colorCoverage)) {
    normalizedColorCoverage[toCountryFlagColor(color)] = coverage;
  }

  return normalizedColorCoverage;
}

function toCountryFlagColor(color: string): CountryFlagColor {
  switch (color) {
    case "black":
    case "blue":
    case "brown":
    case "gray":
    case "green":
    case "orange":
    case "purple":
    case "red":
    case "white":
    case "yellow":
      return color;
    default:
      throw new Error(`Invalid country flag color: ${color}`);
  }
}
