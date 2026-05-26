import type { MapBounds } from "@geopoto/geo-data";

import type { LayoutSize, MapPoint, MapViewport } from "./map-viewer-viewport";

interface PanMapGestureState {
  type: "pan";
  viewport: MapViewport;
}

export interface PinchMapGestureState {
  type: "pinch";
  focalPoint: MapPoint;
  focalRatio: MapPoint;
  viewport: MapViewport;
}

export type MapGestureState = PanMapGestureState | PinchMapGestureState;

interface BuildPanMapGestureStateParams {
  viewport: MapViewport;
}

interface BuildPinchMapGestureStateParams {
  focalPoint: MapPoint;
  layoutSize: LayoutSize;
  viewport: MapViewport;
}

export interface MapPanGestureTranslation {
  translationX: number;
  translationY: number;
}

interface GetPannedViewportParams {
  bounds: MapBounds;
  gestureState: MapPanGestureTranslation;
  layoutSize: LayoutSize;
  minimumViewportWidth: number;
  viewport: MapViewport;
}

interface GetPinchedViewportParams {
  bounds: MapBounds;
  gestureState: PinchMapGestureState;
  minimumViewportWidth: number;
  scale: number;
}

interface GetTapZoomedViewportParams {
  bounds: MapBounds;
  focalPoint: MapPoint;
  layoutSize: LayoutSize;
  minimumViewportWidth: number;
  scale: number;
  viewport: MapViewport;
}

interface GetMapPointFromScreenPointParams {
  layoutSize: LayoutSize;
  screenPoint: MapPoint;
  viewport: MapViewport;
}

export function buildPanMapGestureState({
  viewport,
}: BuildPanMapGestureStateParams): MapGestureState {
  "worklet";

  return {
    type: "pan",
    viewport,
  };
}

export function buildPinchMapGestureState({
  focalPoint: screenPoint,
  layoutSize,
  viewport,
}: BuildPinchMapGestureStateParams): PinchMapGestureState {
  "worklet";

  const focalPoint = {
    x:
      viewport.x +
      (screenPoint.x / Math.max(layoutSize.width, 1)) * viewport.width,
    y:
      viewport.y +
      (screenPoint.y / Math.max(layoutSize.height, 1)) * viewport.height,
  };

  return {
    focalPoint,
    focalRatio: {
      x: (focalPoint.x - viewport.x) / viewport.width,
      y: (focalPoint.y - viewport.y) / viewport.height,
    },
    type: "pinch",
    viewport,
  };
}

export function getPannedViewport({
  bounds,
  gestureState,
  layoutSize,
  minimumViewportWidth,
  viewport,
}: GetPannedViewportParams): MapViewport {
  "worklet";

  const mapUnitsPerPixel = viewport.width / Math.max(layoutSize.width, 1);
  const nextViewport = {
    ...viewport,
    x: viewport.x - gestureState.translationX * mapUnitsPerPixel,
    y: viewport.y - gestureState.translationY * mapUnitsPerPixel,
  };
  const aspectRatio = nextViewport.width / nextViewport.height;
  const availableWidth = bounds.maxX - bounds.minX;
  const availableHeight = bounds.maxY - bounds.minY;
  const width = Math.min(
    Math.max(
      nextViewport.width,
      Math.min(minimumViewportWidth, availableWidth),
    ),
    availableWidth,
  );
  const height = width / aspectRatio;
  const x =
    width >= availableWidth
      ? bounds.minX - (width - availableWidth) / 2
      : Math.min(Math.max(nextViewport.x, bounds.minX), bounds.maxX - width);
  const y =
    height >= availableHeight
      ? bounds.minY - (height - availableHeight) / 2
      : Math.min(Math.max(nextViewport.y, bounds.minY), bounds.maxY - height);

  return {
    ...nextViewport,
    height,
    width,
    x,
    y,
  };
}

export function getPinchedViewport({
  bounds,
  gestureState,
  minimumViewportWidth,
  scale,
}: GetPinchedViewportParams): MapViewport {
  "worklet";

  if (scale <= 0) {
    return gestureState.viewport;
  }

  const width = gestureState.viewport.width / scale;
  const height = gestureState.viewport.height / scale;
  const nextViewport = {
    height,
    width,
    x: gestureState.focalPoint.x - gestureState.focalRatio.x * width,
    y: gestureState.focalPoint.y - gestureState.focalRatio.y * height,
  };
  const aspectRatio = nextViewport.width / nextViewport.height;
  const availableWidth = bounds.maxX - bounds.minX;
  const availableHeight = bounds.maxY - bounds.minY;
  const clampedWidth = Math.min(
    Math.max(
      nextViewport.width,
      Math.min(minimumViewportWidth, availableWidth),
    ),
    availableWidth,
  );
  const clampedHeight = clampedWidth / aspectRatio;
  const x =
    clampedWidth >= availableWidth
      ? bounds.minX - (clampedWidth - availableWidth) / 2
      : Math.min(
          Math.max(nextViewport.x, bounds.minX),
          bounds.maxX - clampedWidth,
        );
  const y =
    clampedHeight >= availableHeight
      ? bounds.minY - (clampedHeight - availableHeight) / 2
      : Math.min(
          Math.max(nextViewport.y, bounds.minY),
          bounds.maxY - clampedHeight,
        );

  return {
    ...nextViewport,
    height: clampedHeight,
    width: clampedWidth,
    x,
    y,
  };
}

export function getTapZoomedViewport({
  bounds,
  focalPoint,
  layoutSize,
  minimumViewportWidth,
  scale,
  viewport,
}: GetTapZoomedViewportParams): MapViewport {
  "worklet";

  return getPinchedViewport({
    bounds,
    gestureState: buildPinchMapGestureState({
      focalPoint,
      layoutSize,
      viewport,
    }),
    minimumViewportWidth,
    scale,
  });
}

export function getMapPointFromScreenPoint({
  layoutSize,
  screenPoint,
  viewport,
}: GetMapPointFromScreenPointParams): MapPoint {
  const mapUnitsPerPixelX = viewport.width / Math.max(layoutSize.width, 1);
  const mapUnitsPerPixelY = viewport.height / Math.max(layoutSize.height, 1);

  return {
    x: viewport.x + screenPoint.x * mapUnitsPerPixelX,
    y: viewport.y + screenPoint.y * mapUnitsPerPixelY,
  };
}
