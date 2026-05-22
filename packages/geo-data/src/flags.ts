import flagsData from "../generated/flags.json";

export interface CountryFlag {
  aspectRatio: number;
  code: string;
  lowResolutionPng: CountryFlagDimensions;
  png: CountryFlagDimensions;
  svg: CountryFlagSvg;
}

export interface CountryFlagDimensions {
  height: number;
  width: number;
}

export interface CountryFlagSvg extends CountryFlagDimensions {
  viewBox: string;
}

const COUNTRY_FLAGS_BY_CODE: Readonly<Record<string, CountryFlag>> =
  flagsData satisfies Readonly<Record<string, CountryFlag>>;

export const COUNTRY_FLAGS = COUNTRY_FLAGS_BY_CODE;
export const COUNTRY_FLAG_CODES: readonly string[] = Object.keys(
  COUNTRY_FLAGS_BY_CODE,
);

export function getCountryFlag(code: string): CountryFlag | null {
  return COUNTRY_FLAGS_BY_CODE[code.toUpperCase()] ?? null;
}
