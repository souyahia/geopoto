import type {
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";

import {
  clampViewportToBounds,
  INTERACTIVE_MAP_BOUNDS,
} from "./map-viewer-viewport";
import type { LayoutSize, MapPoint, MapViewport } from "./map-viewer-viewport";

export interface TouchPair {
  firstTouch: GestureResponderEvent["nativeEvent"]["touches"][number];
  secondTouch: GestureResponderEvent["nativeEvent"]["touches"][number];
}

interface PanMapGestureState {
  type: "pan";
  viewport: MapViewport;
}

export interface PinchMapGestureState {
  type: "pinch";
  distance: number;
  focalPoint: MapPoint;
  focalRatio: MapPoint;
  viewport: MapViewport;
}

export type MapGestureState = PanMapGestureState | PinchMapGestureState;

interface GetTouchPairParams {
  touches: readonly GestureResponderEvent["nativeEvent"]["touches"][number][];
}

interface BuildMapGestureStateParams {
  layoutSize: LayoutSize;
  touches: readonly GestureResponderEvent["nativeEvent"]["touches"][number][];
  viewport: MapViewport;
}

interface BuildPinchMapGestureStateParams {
  layoutSize: LayoutSize;
  touches: readonly GestureResponderEvent["nativeEvent"]["touches"][number][];
  viewport: MapViewport;
}

interface GetMapPointFromScreenPointParams {
  layoutSize: LayoutSize;
  screenPoint: MapPoint;
  viewport: MapViewport;
}

interface GetPannedViewportParams {
  gestureState: PanResponderGestureState;
  layoutSize: LayoutSize;
  viewport: MapViewport;
}

interface GetPinchedViewportParams {
  currentDistance: number;
  gestureState: PinchMapGestureState;
}

export function getTouchPair({
  touches,
}: GetTouchPairParams): TouchPair | null {
  const firstTouch = touches[0];
  const secondTouch = touches[1];

  if (firstTouch === undefined || secondTouch === undefined) {
    return null;
  }

  return { firstTouch, secondTouch };
}

export function buildMapGestureState({
  layoutSize,
  touches,
  viewport,
}: BuildMapGestureStateParams): MapGestureState {
  return (
    buildPinchMapGestureState({
      layoutSize,
      touches,
      viewport,
    }) ?? {
      type: "pan",
      viewport,
    }
  );
}

export function buildPinchMapGestureState({
  layoutSize,
  touches,
  viewport,
}: BuildPinchMapGestureStateParams): PinchMapGestureState | null {
  const touchPair = getTouchPair({ touches });

  if (touchPair === null) {
    return null;
  }

  const distance = getTouchDistance(touchPair);

  if (distance <= 0) {
    return null;
  }

  const screenPoint = getTouchMidpoint(touchPair);
  const focalPoint = getMapPointFromScreenPoint({
    layoutSize,
    screenPoint,
    viewport,
  });

  return {
    distance,
    focalPoint,
    focalRatio: {
      x: (focalPoint.x - viewport.x) / viewport.width,
      y: (focalPoint.y - viewport.y) / viewport.height,
    },
    type: "pinch",
    viewport,
  };
}

function getMapPointFromScreenPoint({
  layoutSize,
  screenPoint,
  viewport,
}: GetMapPointFromScreenPointParams): MapPoint {
  return {
    x:
      viewport.x +
      (screenPoint.x / Math.max(layoutSize.width, 1)) * viewport.width,
    y:
      viewport.y +
      (screenPoint.y / Math.max(layoutSize.height, 1)) * viewport.height,
  };
}

export function getPannedViewport({
  gestureState,
  layoutSize,
  viewport,
}: GetPannedViewportParams): MapViewport {
  const mapUnitsPerPixel = viewport.width / Math.max(layoutSize.width, 1);

  return clampViewportToBounds({
    bounds: INTERACTIVE_MAP_BOUNDS,
    viewport: {
      ...viewport,
      x: viewport.x - gestureState.dx * mapUnitsPerPixel,
      y: viewport.y - gestureState.dy * mapUnitsPerPixel,
    },
  });
}

export function getPinchedViewport({
  currentDistance,
  gestureState,
}: GetPinchedViewportParams): MapViewport {
  if (currentDistance <= 0) {
    return gestureState.viewport;
  }

  const zoomScale = currentDistance / gestureState.distance;
  const width = gestureState.viewport.width / zoomScale;
  const height = gestureState.viewport.height / zoomScale;

  return clampViewportToBounds({
    bounds: INTERACTIVE_MAP_BOUNDS,
    viewport: {
      height,
      width,
      x: gestureState.focalPoint.x - gestureState.focalRatio.x * width,
      y: gestureState.focalPoint.y - gestureState.focalRatio.y * height,
    },
  });
}

export function getTouchDistance({
  firstTouch,
  secondTouch,
}: TouchPair): number {
  return Math.hypot(
    firstTouch.locationX - secondTouch.locationX,
    firstTouch.locationY - secondTouch.locationY,
  );
}

function getTouchMidpoint({ firstTouch, secondTouch }: TouchPair): MapPoint {
  return {
    x: (firstTouch.locationX + secondTouch.locationX) / 2,
    y: (firstTouch.locationY + secondTouch.locationY) / 2,
  };
}
