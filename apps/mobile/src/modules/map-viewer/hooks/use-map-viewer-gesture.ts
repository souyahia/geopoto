import { useCallback, useEffect, useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { runOnJS, useSharedValue } from "react-native-reanimated";

import {
  buildPanMapGestureState,
  buildPinchMapGestureState,
  getPannedViewport,
  getPinchedViewport,
  type MapGestureState,
} from "../utils/map-viewer-gestures";
import {
  INTERACTIVE_MAP_BOUNDS,
  MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
} from "../utils/map-viewer-viewport";
import type { LayoutSize, MapViewport } from "../utils/map-viewer-viewport";
import type { MapViewerViewportSharedValues } from "./use-map-viewer-skia-presentation";

interface UseMapViewerGestureParams {
  commitViewport: (viewport: MapViewport) => void;
  isInteractive: boolean;
  layoutSizeValue: SharedValue<LayoutSize>;
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

export function useMapViewerGesture({
  commitViewport,
  isInteractive,
  layoutSizeValue,
  viewport,
  viewportValues,
}: UseMapViewerGestureParams) {
  const gestureStateValue = useSharedValue<MapGestureState | null>(null);
  const hasGestureMovedValue = useSharedValue(false);

  useEffect(() => {
    gestureStateValue.value = null;
    hasGestureMovedValue.value = false;
  }, [gestureStateValue, hasGestureMovedValue, isInteractive, viewport]);

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

      runOnJS(commitViewport)(
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
      .minDistance(0)
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
