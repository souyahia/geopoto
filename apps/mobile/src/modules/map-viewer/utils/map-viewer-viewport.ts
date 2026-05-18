import {
  type Country,
  MAP_REGIONS,
  type MapRegionName,
  type MapBounds,
} from "@geopoto/geo-data";

export interface LayoutSize {
  height: number;
  width: number;
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface MapViewport {
  height: number;
  width: number;
  x: number;
  y: number;
}

export type MapViewerHighlightTarget =
  | { type: "country"; country: Country }
  | { type: "region"; region: MapRegionName };

export type MapViewerCenterTarget =
  | MapViewerHighlightTarget
  | { type: "bounds"; bounds: MapBounds };

interface BuildInitialViewportParams {
  aspectRatio: number;
  centersOn: MapViewerCenterTarget;
}

interface FitBoundsToAspectRatioParams {
  aspectRatio: number;
  bounds: MapBounds;
}

interface ExpandBoundsParams {
  bounds: MapBounds;
  paddingRatio: number;
}

interface ExpandBoundsToMinimumSizeParams {
  bounds: MapBounds;
  minimumHeight: number;
  minimumWidth: number;
}

interface BoundsFromCenterParams {
  center: MapPoint;
  height: number;
  width: number;
}

interface ViewportFromCenterParams {
  center: MapPoint;
  height: number;
  width: number;
}

interface ClampParams {
  maximum: number;
  minimum: number;
  value: number;
}

interface ClampAxisParams {
  maximum: number;
  minimum: number;
  size: number;
  value: number;
}

interface ClampViewportSizeParams {
  viewport: MapViewport;
}

interface ClampViewportToBoundsParams {
  bounds: MapBounds;
  viewport: MapViewport;
}

interface GetStrokeWidthParams {
  layoutSize: LayoutSize;
  viewport: MapViewport;
}

const COUNTRY_TARGET_PADDING_RATIO = 0.42;
const REGION_TARGET_PADDING_RATIO = 0.08;
const COUNTRY_TARGET_MINIMUM_HEIGHT = 34;
const COUNTRY_TARGET_MINIMUM_WIDTH = 50;
const WORLD_PADDING_RATIO = 0.06;
const MINIMUM_INTERACTIVE_VIEWPORT_WIDTH = 3;

const FALLBACK_WORLD_BOUNDS: MapBounds = {
  maxX: 1052.695,
  maxY: 499.483,
  minX: -49.594,
  minY: -49.826,
};

export const WORLD_MAP_BOUNDS =
  MAP_REGIONS.find((region) => region.name === "world")?.bounds ??
  FALLBACK_WORLD_BOUNDS;

export const INTERACTIVE_MAP_BOUNDS = expandBounds({
  bounds: WORLD_MAP_BOUNDS,
  paddingRatio: WORLD_PADDING_RATIO,
});

export function buildInitialViewport(
  params: BuildInitialViewportParams,
): MapViewport {
  const { aspectRatio, centersOn } = params;
  const targetBounds = getTargetBounds(centersOn);
  const paddingRatio =
    centersOn.type === "country"
      ? COUNTRY_TARGET_PADDING_RATIO
      : REGION_TARGET_PADDING_RATIO;
  const paddedBounds = expandBounds({
    bounds: targetBounds,
    paddingRatio,
  });
  const sizedBounds =
    centersOn.type === "country"
      ? expandBoundsToMinimumSize({
          bounds: paddedBounds,
          minimumHeight: COUNTRY_TARGET_MINIMUM_HEIGHT,
          minimumWidth: COUNTRY_TARGET_MINIMUM_WIDTH,
        })
      : paddedBounds;
  const fittedViewport = fitBoundsToAspectRatio({
    aspectRatio,
    bounds: sizedBounds,
  });

  return clampViewportToBounds({
    bounds: INTERACTIVE_MAP_BOUNDS,
    viewport: fittedViewport,
  });
}

function getTargetBounds(target: MapViewerCenterTarget): MapBounds {
  switch (target.type) {
    case "bounds":
      return target.bounds;
    case "country":
      return target.country.map.bounds;
    case "region":
      return (
        MAP_REGIONS.find((region) => region.name === target.region)?.bounds ??
        WORLD_MAP_BOUNDS
      );
    default:
      return WORLD_MAP_BOUNDS;
  }
}

export function getMapViewerCenterTargetKey(
  target: MapViewerCenterTarget,
): string {
  switch (target.type) {
    case "bounds":
      return `bounds:${getBoundsKey(target.bounds)}`;
    case "country":
      return `country:${target.country.code}:${getBoundsKey(target.country.map.bounds)}`;
    case "region":
      return `region:${target.region}`;
    default:
      return `bounds:${getBoundsKey(WORLD_MAP_BOUNDS)}`;
  }
}

function getBoundsKey(bounds: MapBounds): string {
  return `${bounds.minX}:${bounds.minY}:${bounds.maxX}:${bounds.maxY}`;
}

function fitBoundsToAspectRatio(
  params: FitBoundsToAspectRatioParams,
): MapViewport {
  const { aspectRatio, bounds } = params;
  const boundsWidth = getBoundsWidth(bounds);
  const boundsHeight = getBoundsHeight(bounds);
  const boundsAspectRatio = boundsWidth / boundsHeight;
  const center = getBoundsCenter(bounds);

  if (boundsAspectRatio > aspectRatio) {
    const height = boundsWidth / aspectRatio;

    return getViewportFromCenter({
      center,
      height,
      width: boundsWidth,
    });
  }

  const width = boundsHeight * aspectRatio;

  return getViewportFromCenter({
    center,
    height: boundsHeight,
    width,
  });
}

function expandBounds(params: ExpandBoundsParams): MapBounds {
  const { bounds, paddingRatio } = params;
  const horizontalPadding = getBoundsWidth(bounds) * paddingRatio;
  const verticalPadding = getBoundsHeight(bounds) * paddingRatio;

  return {
    maxX: bounds.maxX + horizontalPadding,
    maxY: bounds.maxY + verticalPadding,
    minX: bounds.minX - horizontalPadding,
    minY: bounds.minY - verticalPadding,
  };
}

function expandBoundsToMinimumSize(
  params: ExpandBoundsToMinimumSizeParams,
): MapBounds {
  const { bounds, minimumHeight, minimumWidth } = params;
  const width = Math.max(getBoundsWidth(bounds), minimumWidth);
  const height = Math.max(getBoundsHeight(bounds), minimumHeight);

  return getBoundsFromCenter({
    center: getBoundsCenter(bounds),
    height,
    width,
  });
}

function getBoundsCenter(bounds: MapBounds): MapPoint {
  return {
    x: bounds.minX + getBoundsWidth(bounds) / 2,
    y: bounds.minY + getBoundsHeight(bounds) / 2,
  };
}

function getBoundsFromCenter(params: BoundsFromCenterParams): MapBounds {
  const { center, height, width } = params;

  return {
    maxX: center.x + width / 2,
    maxY: center.y + height / 2,
    minX: center.x - width / 2,
    minY: center.y - height / 2,
  };
}

function getViewportFromCenter(params: ViewportFromCenterParams): MapViewport {
  const { center, height, width } = params;

  return {
    height,
    width,
    x: center.x - width / 2,
    y: center.y - height / 2,
  };
}

function getBoundsHeight(bounds: MapBounds): number {
  return bounds.maxY - bounds.minY;
}

function getBoundsWidth(bounds: MapBounds): number {
  return bounds.maxX - bounds.minX;
}

function clamp(params: ClampParams): number {
  const { maximum, minimum, value } = params;

  return Math.min(Math.max(value, minimum), maximum);
}

function clampAxis(params: ClampAxisParams): number {
  const { maximum, minimum, size, value } = params;
  const availableSize = maximum - minimum;

  if (size >= availableSize) {
    return minimum - (size - availableSize) / 2;
  }

  return clamp({
    maximum: maximum - size,
    minimum,
    value,
  });
}

function clampViewportSize(params: ClampViewportSizeParams): MapViewport {
  const { viewport } = params;
  const aspectRatio = viewport.width / viewport.height;
  const maximumWidth = getBoundsWidth(INTERACTIVE_MAP_BOUNDS);
  const minimumWidth = Math.min(
    MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
    maximumWidth,
  );
  const width = clamp({
    maximum: maximumWidth,
    minimum: minimumWidth,
    value: viewport.width,
  });

  return {
    ...viewport,
    height: width / aspectRatio,
    width,
  };
}

export function clampViewportToBounds(
  params: ClampViewportToBoundsParams,
): MapViewport {
  const { bounds, viewport } = params;
  const sizedViewport = clampViewportSize({ viewport });

  return {
    ...sizedViewport,
    x: clampAxis({
      maximum: bounds.maxX,
      minimum: bounds.minX,
      size: sizedViewport.width,
      value: sizedViewport.x,
    }),
    y: clampAxis({
      maximum: bounds.maxY,
      minimum: bounds.minY,
      size: sizedViewport.height,
      value: sizedViewport.y,
    }),
  };
}

export function getStrokeWidth(params: GetStrokeWidthParams): number {
  const { layoutSize, viewport } = params;

  return Math.max(viewport.width / Math.max(layoutSize.width, 1), 0.08);
}
