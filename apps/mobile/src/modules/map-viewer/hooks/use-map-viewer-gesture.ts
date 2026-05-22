import { useCallback, useEffect, useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import type {
  GestureStateManager,
  GestureTouchEvent,
} from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  buildPanMapGestureState,
  buildPinchMapGestureState,
  getPannedViewport,
  getPinchedViewport,
  getTapZoomedViewport,
  type MapGestureState,
} from "../utils/map-viewer-gestures";
import {
  INTERACTIVE_MAP_BOUNDS,
  MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
} from "../utils/map-viewer-viewport";
import type { LayoutSize, MapViewport } from "../utils/map-viewer-viewport";
import type { MapViewerViewportSharedValues } from "./use-map-viewer-skia-presentation";

const MAP_VIEWER_TAP_ZOOM_ANIMATION_DURATION = 180;
const MAP_VIEWER_TAP_ZOOM_SCALE = 2.05;

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

interface AnimateViewportParams {
  animationIdValue: SharedValue<number>;
  commitViewport: (viewport: MapViewport) => void;
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
  const tapZoomAnimationIdValue = useSharedValue(0);

  useEffect(() => {
    gestureStateValue.value = null;
    hasGestureMovedValue.value = false;
    tapZoomAnimationIdValue.value += 1;
  }, [
    gestureStateValue,
    hasGestureMovedValue,
    isInteractive,
    tapZoomAnimationIdValue,
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

    const doubleTapGesture = Gesture.Tap()
      .enabled(isInteractive)
      .onTouchesDown(failTapZoomWhenMultipleTouches)
      .numberOfTaps(2)
      .onEnd((event, isSuccessful) => {
        "worklet";

        if (!isSuccessful) {
          return;
        }

        animateViewport({
          animationIdValue: tapZoomAnimationIdValue,
          commitViewport,
          viewport: getTapZoomedViewport({
            bounds: INTERACTIVE_MAP_BOUNDS,
            focalPoint: {
              x: event.x,
              y: event.y,
            },
            layoutSize: layoutSizeValue.value,
            minimumViewportWidth: MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
            scale: MAP_VIEWER_TAP_ZOOM_SCALE,
            viewport: getViewportFromSharedValues({
              viewportValues,
            }),
          }),
          viewportValues,
        });
      });

    const tripleTapGesture = Gesture.Tap()
      .enabled(isInteractive)
      .onTouchesDown(failTapZoomWhenMultipleTouches)
      .numberOfTaps(3)
      .onEnd((event, isSuccessful) => {
        "worklet";

        if (!isSuccessful) {
          return;
        }

        animateViewport({
          animationIdValue: tapZoomAnimationIdValue,
          commitViewport,
          viewport: getTapZoomedViewport({
            bounds: INTERACTIVE_MAP_BOUNDS,
            focalPoint: {
              x: event.x,
              y: event.y,
            },
            layoutSize: layoutSizeValue.value,
            minimumViewportWidth: MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
            scale: 1 / MAP_VIEWER_TAP_ZOOM_SCALE,
            viewport: getViewportFromSharedValues({
              viewportValues,
            }),
          }),
          viewportValues,
        });
      });

    const tapZoomGesture = Gesture.Exclusive(
      tripleTapGesture,
      doubleTapGesture,
    );

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

    return Gesture.Simultaneous(panGesture, pinchGesture, tapZoomGesture);
  }, [
    commitViewport,
    finishGesture,
    gestureStateValue,
    hasGestureMovedValue,
    isInteractive,
    layoutSizeValue,
    tapZoomAnimationIdValue,
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

function failTapZoomWhenMultipleTouches(
  event: GestureTouchEvent,
  stateManager: GestureStateManager,
) {
  "worklet";

  if (event.numberOfTouches === 1) {
    return;
  }

  stateManager.fail();
}

function animateViewport({
  animationIdValue,
  commitViewport,
  viewport,
  viewportValues,
}: AnimateViewportParams) {
  "worklet";

  const animationId = animationIdValue.value + 1;
  const animationConfig = {
    duration: MAP_VIEWER_TAP_ZOOM_ANIMATION_DURATION,
  };

  animationIdValue.value = animationId;
  viewportValues.height.value = withTiming(viewport.height, animationConfig);
  viewportValues.x.value = withTiming(viewport.x, animationConfig);
  viewportValues.y.value = withTiming(viewport.y, animationConfig);
  viewportValues.width.value = withTiming(
    viewport.width,
    animationConfig,
    (isFinished) => {
      if (!isFinished) {
        return;
      }

      if (animationIdValue.value !== animationId) {
        return;
      }

      scheduleOnRN(commitViewport, viewport);
    },
  );
}
