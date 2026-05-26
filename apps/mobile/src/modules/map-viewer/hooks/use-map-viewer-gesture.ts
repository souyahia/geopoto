import { useCallback, useEffect, useMemo, useRef } from "react";
import type { GestureResponderEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  buildPanMapGestureState,
  buildPinchMapGestureState,
  getMapPointFromScreenPoint,
  getPannedViewport,
  getPinchedViewport,
  type MapGestureState,
} from "../utils/map-viewer-gestures";
import {
  INTERACTIVE_MAP_BOUNDS,
  MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
} from "../utils/map-viewer-viewport";
import type {
  LayoutSize,
  MapPoint,
  MapViewport,
} from "../utils/map-viewer-viewport";
import type { MapViewerViewportSharedValues } from "./use-map-viewer-skia-presentation";

const MAP_VIEWER_PRESS_MAX_DISTANCE = 18;
const MAP_VIEWER_PRESS_MAX_DISTANCE_SQUARED =
  MAP_VIEWER_PRESS_MAX_DISTANCE * MAP_VIEWER_PRESS_MAX_DISTANCE;
const MAP_VIEWER_PAN_MIN_DISTANCE = 1;

interface UseMapViewerGestureParams {
  commitViewport: (viewport: MapViewport) => void;
  isInteractive: boolean;
  layoutSizeValue: SharedValue<LayoutSize>;
  onMapPressed?: (point: MapPoint) => void;
  viewport: MapViewport;
  viewportValues: MapViewerViewportSharedValues;
}

interface FinishGestureParams {
  gestureStateValue: SharedValue<MapGestureState | null>;
  hasGestureMovedValue: SharedValue<boolean>;
  type: MapGestureState["type"];
  viewportValues: MapViewerViewportSharedValues;
}

interface GetViewportFromSharedValuesParams {
  viewportValues: MapViewerViewportSharedValues;
}

interface ApplyPanViewportParams {
  viewport: MapViewport;
  viewportValues: MapViewerViewportSharedValues;
}

interface ApplyPinchViewportParams {
  viewport: MapViewport;
  viewportValues: MapViewerViewportSharedValues;
}

interface MapPressCandidate {
  hasMoved: boolean;
  startX: number;
  startY: number;
}

interface MapViewerPressTouchHandlers {
  onTouchCancel: (event: GestureResponderEvent) => void;
  onTouchEnd: (event: GestureResponderEvent) => void;
  onTouchMove: (event: GestureResponderEvent) => void;
  onTouchStart: (event: GestureResponderEvent) => void;
}

export function useMapViewerGesture({
  commitViewport,
  isInteractive,
  layoutSizeValue,
  onMapPressed,
  viewport,
  viewportValues,
}: UseMapViewerGestureParams) {
  const gestureStateValue = useSharedValue<MapGestureState | null>(null);
  const hasGestureMovedValue = useSharedValue(false);
  const mapPressCandidateRef = useRef<MapPressCandidate | null>(null);

  const cancelMapPressCandidate = useCallback(() => {
    mapPressCandidateRef.current = null;
  }, []);

  const mapPressTouchHandlers = useMemo<MapViewerPressTouchHandlers>(
    () => ({
      onTouchCancel: () => {
        cancelMapPressCandidate();
      },
      onTouchEnd: (event) => {
        const candidate = mapPressCandidateRef.current;
        mapPressCandidateRef.current = null;

        if (!isInteractive) {
          return;
        }

        if (candidate === null) {
          return;
        }

        if (candidate.hasMoved) {
          return;
        }

        if (event.nativeEvent.touches.length > 0) {
          return;
        }

        const [changedTouch] = event.nativeEvent.changedTouches;

        if (changedTouch === undefined) {
          return;
        }

        const screenPoint = {
          x: changedTouch.locationX,
          y: changedTouch.locationY,
        };

        if (onMapPressed === undefined) {
          return;
        }

        onMapPressed(
          getMapPointFromScreenPoint({
            layoutSize: layoutSizeValue.value,
            screenPoint,
            viewport: getViewportFromSharedValues({
              viewportValues,
            }),
          }),
        );
      },
      onTouchMove: (event) => {
        const candidate = mapPressCandidateRef.current;

        if (candidate === null) {
          return;
        }

        if (!isInteractive) {
          mapPressCandidateRef.current = null;
          return;
        }

        if (event.nativeEvent.touches.length !== 1) {
          candidate.hasMoved = true;
          return;
        }

        const [touch] = event.nativeEvent.touches;

        if (touch === undefined) {
          candidate.hasMoved = true;
          return;
        }

        const translationX = touch.locationX - candidate.startX;
        const translationY = touch.locationY - candidate.startY;
        const distanceSquared =
          translationX * translationX + translationY * translationY;

        if (distanceSquared <= MAP_VIEWER_PRESS_MAX_DISTANCE_SQUARED) {
          return;
        }

        candidate.hasMoved = true;
      },
      onTouchStart: (event) => {
        if (!isInteractive) {
          mapPressCandidateRef.current = null;
          return;
        }

        if (event.nativeEvent.touches.length !== 1) {
          mapPressCandidateRef.current = null;
          return;
        }

        const [touch] = event.nativeEvent.touches;

        if (touch === undefined) {
          mapPressCandidateRef.current = null;
          return;
        }

        mapPressCandidateRef.current = {
          hasMoved: false,
          startX: touch.locationX,
          startY: touch.locationY,
        };
      },
    }),
    [
      cancelMapPressCandidate,
      isInteractive,
      layoutSizeValue,
      onMapPressed,
      viewportValues,
    ],
  );

  useEffect(() => {
    gestureStateValue.value = null;
    hasGestureMovedValue.value = false;
    mapPressCandidateRef.current = null;
  }, [
    gestureStateValue,
    hasGestureMovedValue,
    isInteractive,
    viewport,
  ]);

  const finishGesture = useCallback(
    ({
      gestureStateValue,
      hasGestureMovedValue,
      type,
      viewportValues,
    }: FinishGestureParams) => {
      "worklet";

      const currentGestureState = gestureStateValue.value;

      if (currentGestureState === null) {
        return;
      }

      if (currentGestureState.type !== type) {
        return;
      }

      gestureStateValue.value = null;

      if (!hasGestureMovedValue.value) {
        return;
      }

      scheduleOnRN(
        commitViewport,
        getViewportFromSharedValues({
          viewportValues,
        }),
      );
    },
    [commitViewport],
  );

  const gesture = useMemo(() => {
    const panGesture = Gesture.Pan()
      .enabled(isInteractive)
      .maxPointers(1)
      .minDistance(MAP_VIEWER_PAN_MIN_DISTANCE)
      .onStart(() => {
        "worklet";

        gestureStateValue.value = buildPanMapGestureState({
          viewport: getViewportFromSharedValues({
            viewportValues,
          }),
        });
        hasGestureMovedValue.value = false;
      })
      .onUpdate((event) => {
        "worklet";

        const currentGestureState = gestureStateValue.value;

        if (currentGestureState === null) {
          return;
        }

        if (currentGestureState.type !== "pan") {
          return;
        }

        if (event.numberOfPointers !== 1) {
          return;
        }

        applyPanViewport({
          viewport: getPannedViewport({
            bounds: INTERACTIVE_MAP_BOUNDS,
            gestureState: event,
            layoutSize: layoutSizeValue.value,
            minimumViewportWidth: MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
            viewport: currentGestureState.viewport,
          }),
          viewportValues,
        });
        hasGestureMovedValue.value = true;
      })
      .onFinalize(() => {
        "worklet";

        finishGesture({
          gestureStateValue,
          hasGestureMovedValue,
          type: "pan",
          viewportValues,
        });
      });

    const pinchGesture = Gesture.Pinch()
      .enabled(isInteractive)
      .onStart((event) => {
        "worklet";

        gestureStateValue.value = buildPinchMapGestureState({
          focalPoint: {
            x: event.focalX,
            y: event.focalY,
          },
          layoutSize: layoutSizeValue.value,
          viewport: getViewportFromSharedValues({
            viewportValues,
          }),
        });
        hasGestureMovedValue.value = false;
      })
      .onUpdate((event) => {
        "worklet";

        const currentGestureState = gestureStateValue.value;

        if (currentGestureState === null) {
          return;
        }

        if (currentGestureState.type !== "pinch") {
          return;
        }

        applyPinchViewport({
          viewport: getPinchedViewport({
            bounds: INTERACTIVE_MAP_BOUNDS,
            gestureState: currentGestureState,
            minimumViewportWidth: MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
            scale: event.scale,
          }),
          viewportValues,
        });
        hasGestureMovedValue.value = true;
      })
      .onFinalize(() => {
        "worklet";

        finishGesture({
          gestureStateValue,
          hasGestureMovedValue,
          type: "pinch",
          viewportValues,
        });
      });

    return Gesture.Simultaneous(panGesture, pinchGesture);
  }, [
    finishGesture,
    gestureStateValue,
    hasGestureMovedValue,
    isInteractive,
    layoutSizeValue,
    viewportValues,
  ]);

  return {
    gesture,
    mapPressTouchHandlers,
  };
}

function getViewportFromSharedValues({
  viewportValues,
}: GetViewportFromSharedValuesParams): MapViewport {
  "worklet";

  return {
    height: viewportValues.height.value,
    width: viewportValues.width.value,
    x: viewportValues.x.value,
    y: viewportValues.y.value,
  };
}

function applyPanViewport({
  viewport,
  viewportValues,
}: ApplyPanViewportParams) {
  "worklet";

  viewportValues.x.value = viewport.x;
  viewportValues.y.value = viewport.y;
}

function applyPinchViewport({
  viewport,
  viewportValues,
}: ApplyPinchViewportParams) {
  "worklet";

  viewportValues.height.value = viewport.height;
  viewportValues.width.value = viewport.width;
  viewportValues.x.value = viewport.x;
  viewportValues.y.value = viewport.y;
}
