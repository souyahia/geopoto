import type { CountryPressArea, MapBounds } from "../../src/map-definition.ts";
import { formatNumber } from "./country-map.ts";

interface BuildSimpleCountryPressAreaParams {
  countryCode: string;
  mapBounds: MapBounds;
}

interface BuildCuratedCountryPressAreaParams {
  countryCode: string;
}

interface BuildOverlapReviewedCountryPressAreaParams {
  countryCode: string;
  mapBounds: MapBounds;
}

interface BuildCountryPressAreaParams {
  countryCode: string;
  mapBounds: MapBounds;
}

interface BuildConfiguredCountryPressAreaShapeParams {
  countryCode: string;
  mapBounds: MapBounds;
}

interface GetSimpleCountryPressAreaRadiusParams {
  countryCode: string;
}

interface GetOverlapReviewedCountryPressAreaSourceParams {
  countryCode: string;
}

interface BuildCountryPressAreaShapeFromSourceParams {
  mapBounds: MapBounds;
  source: CountryPressAreaSource;
}

interface CreateCountryPressAreaFromShapeParams {
  shape: CountryPressAreaShape;
}

interface CreateCircleCountryPressAreaParams {
  center: MapPoint;
  radius: number;
}

interface CreatePolygonCountryPressAreaParams {
  points: readonly MapPoint[];
}

interface GetMapBoundsCenterParams {
  bounds: MapBounds;
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface CircleCountryPressAreaShape {
  kind: "circle";
  center: MapPoint;
  radius: number;
}

export interface PolygonCountryPressAreaShape {
  kind: "polygon";
  points: readonly MapPoint[];
}

export type CountryPressAreaShape =
  | CircleCountryPressAreaShape
  | PolygonCountryPressAreaShape;

type CountryPressAreaSource =
  | { kind: "circle"; radius?: number }
  | { kind: "polygon"; points: readonly MapPoint[] };

export const SIMPLE_COUNTRY_PRESS_AREA_DEFAULT_RADIUS = 1.5;
export const SIMPLE_COUNTRY_PRESS_AREA_COUNTRY_CODES = [
  "AD",
  "BH",
  "BN",
  "LI",
  "MU",
  "MC",
  "CV",
  "KM",
  "MV",
  "MT",
  "SM",
  "ST",
  "SC",
  "SG",
  "VA",
] as const;
export const CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODES = [
  "PW",
  "BS",
  "FJ",
  "KI",
  "MH",
  "FM",
  "NR",
  "WS",
  "SB",
  "TV",
  "VU",
] as const;
export const OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODES = [
  "BB",
  "DM",
  "GD",
  "LC",
  "AG",
  "KN",
  "VC",
  "TO",
  "TT",
] as const;
export const COUNTRY_PRESS_AREA_COUNTRY_CODES = [
  ...SIMPLE_COUNTRY_PRESS_AREA_COUNTRY_CODES,
  ...CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODES,
  ...OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODES,
] as const;

const SIMPLE_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET = new Set<string>(
  SIMPLE_COUNTRY_PRESS_AREA_COUNTRY_CODES,
);
const SIMPLE_COUNTRY_PRESS_AREA_RADIUS_OVERRIDES: Readonly<
  Record<string, number>
> = {
  CV: SIMPLE_COUNTRY_PRESS_AREA_DEFAULT_RADIUS * 2,
};
const CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET = new Set<string>(
  CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODES,
);
const OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET = new Set<string>(
  OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODES,
);
const CURATED_COUNTRY_PRESS_AREA_POINTS_BY_COUNTRY_CODE = {
  BS: [
    { x: 389.548, y: 210.462 },
    { x: 392.959, y: 210.462 },
    { x: 399.781, y: 215.657 },
    { x: 399.781, y: 220.851 },
    { x: 397.223, y: 220.851 },
    { x: 389.548, y: 215.657 },
  ],
  FJ: [
    { x: 740.8, y: 266.4 },
    { x: 753.8, y: 266.4 },
    { x: 753.8, y: 282.2 },
    { x: 740.8, y: 282.2 },
  ],
  FM: [
    { x: 690.2, y: 235 },
    { x: 727.8, y: 235 },
    { x: 727.8, y: 244.3 },
    { x: 690.2, y: 244.3 },
  ],
  KI: [
    { x: 734.2, y: 243.8 },
    { x: 743.5, y: 243.8 },
    { x: 743.5, y: 252 },
    { x: 754.5, y: 252 },
    { x: 754.5, y: 252.8 },
    { x: 764, y: 252.8 },
    { x: 764, y: 252 },
    { x: 777, y: 252 },
    { x: 777, y: 243.2 },
    { x: 783, y: 243.2 },
    { x: 783, y: 253.2 },
    { x: 786, y: 253.2 },
    { x: 786, y: 257 },
    { x: 790.6, y: 257 },
    { x: 790.6, y: 267.4 },
    { x: 782, y: 267.4 },
    { x: 782, y: 259 },
    { x: 764, y: 259 },
    { x: 764, y: 260 },
    { x: 754.5, y: 260 },
    { x: 754.5, y: 254.8 },
    { x: 743.5, y: 254.8 },
    { x: 743.5, y: 253.2 },
    { x: 734.2, y: 253.2 },
  ],
  MH: [
    { x: 730.3, y: 233 },
    { x: 740, y: 233 },
    { x: 740, y: 243.1 },
    { x: 730.3, y: 243.1 },
  ],
  NR: [
    { x: 729.8, y: 248.7 },
    { x: 733.8, y: 248.7 },
    { x: 733.8, y: 252.9 },
    { x: 729.8, y: 252.9 },
  ],
  PW: [
    { x: 680.5, y: 238 },
    { x: 688.8, y: 238 },
    { x: 688.8, y: 247.2 },
    { x: 680.5, y: 247.2 },
  ],
  SB: [
    { x: 716, y: 259 },
    { x: 733.7, y: 259 },
    { x: 733.7, y: 267.8 },
    { x: 716, y: 267.8 },
  ],
  TV: [
    { x: 743.5, y: 256.8 },
    { x: 751, y: 256.8 },
    { x: 751, y: 264.6 },
    { x: 743.5, y: 264.6 },
  ],
  VU: [
    { x: 730, y: 268.6 },
    { x: 737.6, y: 268.6 },
    { x: 737.6, y: 280.1 },
    { x: 730, y: 280.1 },
  ],
  WS: [
    { x: 758.7, y: 267.5 },
    { x: 763.2, y: 267.5 },
    { x: 763.2, y: 271.1 },
    { x: 758.7, y: 271.1 },
  ],
} satisfies Readonly<
  Record<
    (typeof CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODES)[number],
    readonly MapPoint[]
  >
>;
const OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_SOURCE_BY_COUNTRY_CODE = {
  AG: {
    kind: "polygon",
    points: [
      { x: 413.65, y: 224.55 },
      { x: 414.55, y: 224.55 },
      { x: 414.55, y: 226.45 },
      { x: 413.65, y: 226.45 },
    ],
  },
  BB: {
    kind: "polygon",
    points: [
      { x: 416.8, y: 231.1 },
      { x: 417.8, y: 231.1 },
      { x: 417.8, y: 231.95 },
      { x: 416.8, y: 231.95 },
    ],
  },
  DM: {
    kind: "polygon",
    points: [
      { x: 414.35, y: 227.75 },
      { x: 415.2, y: 227.75 },
      { x: 415.2, y: 228.85 },
      { x: 414.35, y: 228.85 },
    ],
  },
  GD: {
    kind: "polygon",
    points: [
      { x: 413.9, y: 232.65 },
      { x: 414.7, y: 232.65 },
      { x: 414.7, y: 233.45 },
      { x: 413.9, y: 233.45 },
    ],
  },
  KN: {
    kind: "polygon",
    points: [
      { x: 412.5, y: 225.25 },
      { x: 413.45, y: 225.25 },
      { x: 413.45, y: 226.1 },
      { x: 412.5, y: 226.1 },
    ],
  },
  LC: {
    kind: "polygon",
    points: [
      { x: 414.95, y: 230.05 },
      { x: 415.65, y: 230.05 },
      { x: 415.65, y: 230.95 },
      { x: 414.95, y: 230.95 },
    ],
  },
  TO: {
    kind: "circle",
    radius: SIMPLE_COUNTRY_PRESS_AREA_DEFAULT_RADIUS * 2,
  },
  TT: {
    kind: "polygon",
    points: [
      { x: 413.8, y: 233.9 },
      { x: 416.15, y: 233.9 },
      { x: 416.15, y: 236.15 },
      { x: 413.8, y: 236.15 },
    ],
  },
  VC: {
    kind: "polygon",
    points: [
      { x: 414.55, y: 231.15 },
      { x: 415.3, y: 231.15 },
      { x: 415.3, y: 232.35 },
      { x: 414.55, y: 232.35 },
    ],
  },
} satisfies Readonly<
  Record<
    (typeof OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODES)[number],
    CountryPressAreaSource
  >
>;

export function buildCountryPressArea({
  countryCode,
  mapBounds,
}: BuildCountryPressAreaParams): CountryPressArea | undefined {
  const shape = buildConfiguredCountryPressAreaShape({
    countryCode,
    mapBounds,
  });

  if (shape === undefined) {
    return undefined;
  }

  return createCountryPressAreaFromShape({ shape });
}

export function buildConfiguredCountryPressAreaShape({
  countryCode,
  mapBounds,
}: BuildConfiguredCountryPressAreaShapeParams):
  | CountryPressAreaShape
  | undefined {
  if (SIMPLE_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET.has(countryCode)) {
    return {
      center: getMapBoundsCenter({ bounds: mapBounds }),
      kind: "circle",
      radius: getSimpleCountryPressAreaRadius({ countryCode }),
    };
  }

  if (isCuratedCountryPressAreaCountryCode(countryCode)) {
    return {
      kind: "polygon",
      points: CURATED_COUNTRY_PRESS_AREA_POINTS_BY_COUNTRY_CODE[countryCode],
    };
  }

  return buildOverlapReviewedCountryPressAreaShape({
    countryCode,
    mapBounds,
  });
}

export function buildSimpleCountryPressArea({
  countryCode,
  mapBounds,
}: BuildSimpleCountryPressAreaParams): CountryPressArea | undefined {
  if (!SIMPLE_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET.has(countryCode)) {
    return undefined;
  }

  return createCountryPressAreaFromShape({
    shape: {
      center: getMapBoundsCenter({ bounds: mapBounds }),
      kind: "circle",
      radius: getSimpleCountryPressAreaRadius({ countryCode }),
    },
  });
}

export function buildCuratedCountryPressArea({
  countryCode,
}: BuildCuratedCountryPressAreaParams): CountryPressArea | undefined {
  if (!isCuratedCountryPressAreaCountryCode(countryCode)) {
    return undefined;
  }

  return createCountryPressAreaFromShape({
    shape: {
      kind: "polygon",
      points: CURATED_COUNTRY_PRESS_AREA_POINTS_BY_COUNTRY_CODE[countryCode],
    },
  });
}

export function buildOverlapReviewedCountryPressArea({
  countryCode,
  mapBounds,
}: BuildOverlapReviewedCountryPressAreaParams): CountryPressArea | undefined {
  const shape = buildOverlapReviewedCountryPressAreaShape({
    countryCode,
    mapBounds,
  });

  if (shape === undefined) {
    return undefined;
  }

  return createCountryPressAreaFromShape({ shape });
}

function buildOverlapReviewedCountryPressAreaShape({
  countryCode,
  mapBounds,
}: BuildOverlapReviewedCountryPressAreaParams):
  | CountryPressAreaShape
  | undefined {
  const source = getOverlapReviewedCountryPressAreaSource({ countryCode });

  if (source === undefined) {
    return undefined;
  }

  return buildCountryPressAreaShapeFromSource({ mapBounds, source });
}

function getOverlapReviewedCountryPressAreaSource({
  countryCode,
}: GetOverlapReviewedCountryPressAreaSourceParams):
  | CountryPressAreaSource
  | undefined {
  if (!isOverlapReviewedCountryPressAreaCountryCode(countryCode)) {
    return undefined;
  }

  return OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_SOURCE_BY_COUNTRY_CODE[
    countryCode
  ];
}

function buildCountryPressAreaShapeFromSource({
  mapBounds,
  source,
}: BuildCountryPressAreaShapeFromSourceParams): CountryPressAreaShape {
  if (source.kind === "polygon") {
    return {
      kind: "polygon",
      points: source.points,
    };
  }

  return {
    center: getMapBoundsCenter({ bounds: mapBounds }),
    kind: "circle",
    radius: source.radius ?? SIMPLE_COUNTRY_PRESS_AREA_DEFAULT_RADIUS,
  };
}

function createCountryPressAreaFromShape({
  shape,
}: CreateCountryPressAreaFromShapeParams): CountryPressArea {
  if (shape.kind === "polygon") {
    return createPolygonCountryPressArea({
      points: shape.points,
    });
  }

  return createCircleCountryPressArea({
    center: shape.center,
    radius: shape.radius,
  });
}

export function getSimpleCountryPressAreaRadius({
  countryCode,
}: GetSimpleCountryPressAreaRadiusParams): number {
  return (
    SIMPLE_COUNTRY_PRESS_AREA_RADIUS_OVERRIDES[countryCode] ??
    SIMPLE_COUNTRY_PRESS_AREA_DEFAULT_RADIUS
  );
}

function createCircleCountryPressArea({
  center,
  radius,
}: CreateCircleCountryPressAreaParams): CountryPressArea {
  const formattedRadius = formatNumber(radius);
  const formattedDiameter = formatNumber(radius * 2);
  const path = [
    `M${formatNumber(center.x - radius)},${formatNumber(center.y)}`,
    `a${formattedRadius},${formattedRadius} 0 1,0 ${formattedDiameter},0`,
    `a${formattedRadius},${formattedRadius} 0 1,0 -${formattedDiameter},0`,
  ].join("");

  return {
    bounds: {
      maxX: formatNumber(center.x + radius),
      maxY: formatNumber(center.y + radius),
      minX: formatNumber(center.x - radius),
      minY: formatNumber(center.y - radius),
    },
    path,
  };
}

function createPolygonCountryPressArea({
  points,
}: CreatePolygonCountryPressAreaParams): CountryPressArea {
  const [firstPoint, ...remainingPoints] = points;

  if (firstPoint === undefined || remainingPoints.length < 2) {
    throw new Error(
      "Country Press Area polygons require at least three points.",
    );
  }

  const hasInvalidPoint = points.some(
    (point) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
  );

  if (hasInvalidPoint) {
    throw new Error(
      "Country Press Area polygons require finite point coordinates.",
    );
  }

  return {
    bounds: {
      maxX: formatNumber(Math.max(...points.map(({ x }) => x))),
      maxY: formatNumber(Math.max(...points.map(({ y }) => y))),
      minX: formatNumber(Math.min(...points.map(({ x }) => x))),
      minY: formatNumber(Math.min(...points.map(({ y }) => y))),
    },
    path: [
      `M${formatMapPoint(firstPoint)}`,
      ...remainingPoints.map((point) => `L${formatMapPoint(point)}`),
      "Z",
    ].join(""),
  };
}

function getMapBoundsCenter({ bounds }: GetMapBoundsCenterParams): MapPoint {
  return {
    x: formatNumber(bounds.minX + (bounds.maxX - bounds.minX) / 2),
    y: formatNumber(bounds.minY + (bounds.maxY - bounds.minY) / 2),
  };
}

function formatMapPoint(point: MapPoint): string {
  return `${formatNumber(point.x)},${formatNumber(point.y)}`;
}

function isCuratedCountryPressAreaCountryCode(
  countryCode: string,
): countryCode is (typeof CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODES)[number] {
  return CURATED_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET.has(countryCode);
}

function isOverlapReviewedCountryPressAreaCountryCode(
  countryCode: string,
): countryCode is (typeof OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODES)[number] {
  return OVERLAP_REVIEWED_COUNTRY_PRESS_AREA_COUNTRY_CODE_SET.has(countryCode);
}
