import {
  COUNTRY_FLAG_COLORS,
  type CountryFlagColor,
  type CountryFlagColorCoverage,
} from "../../src/flag-colors.ts";

export interface CountryFlagColorMetadata {
  colorCoverage: CountryFlagColorCoverage;
  colors: readonly CountryFlagColor[];
}

interface FlagColorSample {
  height: number;
  pixels: Buffer;
  width: number;
}

interface FlagPixelColor {
  blue: number;
  green: number;
  red: number;
}

interface HslColor {
  hue: number;
  lightness: number;
  saturation: number;
}

interface FlagColorWeight {
  color: CountryFlagColor;
  coverage: number;
}

interface ReadPixelChannelParams {
  offset: number;
  pixels: Buffer;
}

interface ToHueDegreesParams extends FlagPixelColor {
  chroma: number;
  max: number;
}

const MINIMUM_ALPHA = 16;
const PIXEL_CHANNEL_COUNT = 4;
const COLOR_COVERAGE_THRESHOLDS = {
  black: 0.0025,
  blue: 0.0025,
  brown: 0.004,
  gray: 0.02,
  green: 0.0025,
  orange: 0.0025,
  purple: 0.004,
  red: 0.0025,
  white: 0.0025,
  yellow: 0.0025,
} satisfies Readonly<Record<CountryFlagColor, number>>;
const COUNTRY_FLAG_COLOR_ORDER = new Map(
  COUNTRY_FLAG_COLORS.map((color, index) => [color, index]),
);

export function extractCountryFlagColorMetadata({
  height,
  pixels,
  width,
}: FlagColorSample): CountryFlagColorMetadata {
  const expectedPixelLength = width * height * PIXEL_CHANNEL_COUNT;

  if (pixels.length !== expectedPixelLength) {
    throw new Error(
      `Expected ${expectedPixelLength} flag color sample bytes, received ${pixels.length}`,
    );
  }

  const pixelWeightsByColor = new Map<CountryFlagColor, number>();
  let totalPixelWeight = 0;

  for (let offset = 0; offset < pixels.length; offset += PIXEL_CHANNEL_COUNT) {
    const alpha = readPixelChannel({ offset: offset + 3, pixels });
    const isTransparent = alpha < MINIMUM_ALPHA;

    if (isTransparent) {
      continue;
    }

    const color = classifyFlagPixelColor({
      blue: readPixelChannel({ offset: offset + 2, pixels }),
      green: readPixelChannel({ offset: offset + 1, pixels }),
      red: readPixelChannel({ offset, pixels }),
    });
    const pixelWeight = alpha / 255;
    const previousPixelWeight = pixelWeightsByColor.get(color) ?? 0;

    pixelWeightsByColor.set(color, previousPixelWeight + pixelWeight);
    totalPixelWeight += pixelWeight;
  }

  if (totalPixelWeight === 0) {
    return {
      colorCoverage: {},
      colors: [],
    };
  }

  const colorWeights = Array.from(pixelWeightsByColor.entries())
    .map(([color, pixelWeight]) => ({
      color,
      coverage: pixelWeight / totalPixelWeight,
    }))
    .filter(({ color, coverage }) => {
      const threshold = COLOR_COVERAGE_THRESHOLDS[color];
      const hasEnoughCoverage = coverage >= threshold;

      return hasEnoughCoverage;
    })
    .toSorted(compareFlagColorWeights);
  const colorCoverage = toCountryFlagColorCoverage(colorWeights);

  return {
    colorCoverage,
    colors: colorWeights.map(({ color }) => color),
  };
}

function readPixelChannel({ offset, pixels }: ReadPixelChannelParams): number {
  const value = pixels[offset];

  if (value === undefined) {
    throw new Error(`Missing flag color sample byte at offset ${offset}`);
  }

  return value;
}

function classifyFlagPixelColor({
  blue,
  green,
  red,
}: FlagPixelColor): CountryFlagColor {
  const hslColor = toHslColor({ blue, green, red });
  const isDark = hslColor.lightness <= 0.08;
  const isLight = hslColor.lightness >= 0.94;
  const isDesaturated = hslColor.saturation <= 0.14;
  const isBrown =
    hslColor.hue >= 18 && hslColor.hue < 50 && hslColor.lightness < 0.38;

  if (isDark) {
    return "black";
  }

  if (isLight) {
    return "white";
  }

  if (isDesaturated) {
    return "gray";
  }

  if (isBrown) {
    return "brown";
  }

  if (hslColor.hue >= 330 || hslColor.hue < 18) {
    return "red";
  }

  if (hslColor.hue < 38) {
    return "orange";
  }

  if (hslColor.hue < 72) {
    return "yellow";
  }

  if (hslColor.hue < 170) {
    return "green";
  }

  if (hslColor.hue < 260) {
    return "blue";
  }

  return "purple";
}

function toHslColor({ blue, green, red }: FlagPixelColor): HslColor {
  const normalizedRed = red / 255;
  const normalizedGreen = green / 255;
  const normalizedBlue = blue / 255;
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
  const chroma = max - min;
  const lightness = (max + min) / 2;
  const isMonochrome = chroma === 0;

  if (isMonochrome) {
    return {
      hue: 0,
      lightness,
      saturation: 0,
    };
  }

  const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
  const hue = toNormalizedHueDegrees(
    toHueDegrees({
      blue: normalizedBlue,
      chroma,
      green: normalizedGreen,
      max,
      red: normalizedRed,
    }),
  );

  return {
    hue,
    lightness,
    saturation,
  };
}

function toNormalizedHueDegrees(hue: number): number {
  return (hue + 360) % 360;
}

function toHueDegrees({
  blue,
  chroma,
  green,
  max,
  red,
}: ToHueDegreesParams): number {
  if (max === red) {
    return (((green - blue) / chroma) % 6) * 60;
  }

  if (max === green) {
    return ((blue - red) / chroma + 2) * 60;
  }

  return ((red - green) / chroma + 4) * 60;
}

function compareFlagColorWeights(
  left: FlagColorWeight,
  right: FlagColorWeight,
): number {
  if (left.coverage !== right.coverage) {
    return right.coverage - left.coverage;
  }

  return (
    getCountryFlagColorOrder(left.color) - getCountryFlagColorOrder(right.color)
  );
}

function getCountryFlagColorOrder(color: CountryFlagColor): number {
  const order = COUNTRY_FLAG_COLOR_ORDER.get(color);

  if (order === undefined) {
    throw new Error(`Missing flag color order for ${color}`);
  }

  return order;
}

function toCountryFlagColorCoverage(
  colorWeights: readonly FlagColorWeight[],
): CountryFlagColorCoverage {
  const colorCoverage: CountryFlagColorCoverage = {};

  for (const colorWeight of colorWeights) {
    colorCoverage[colorWeight.color] = roundColorCoverage(colorWeight.coverage);
  }

  return colorCoverage;
}

function roundColorCoverage(coverage: number): number {
  return Math.round(coverage * 10000) / 10000;
}
