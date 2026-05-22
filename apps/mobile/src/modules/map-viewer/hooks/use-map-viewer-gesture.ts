import { useCallback, useEffect, useMemo, useRef } from "react";
import type { GestureResponderEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import {
  cancelAnimation,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
const MAP_VIEWER_TAP_ZOOM_DECISION_DELAY = 300;
const MAP_VIEWER_TAP_ZOOM_MAX_DISTANCE = 18;
const MAP_VIEWER_TAP_ZOOM_MAX_DISTANCE_SQUARED =
  MAP_VIEWER_TAP_ZOOM_MAX_DISTANCE * MAP_VIEWER_TAP_ZOOM_MAX_DISTANCE;
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

interface TapZoomPoint {
  x: number;
  y: number;
}

interface TapZoomCandidate {
  hasMoved: boolean;
  startedAt: number;
  startX: number;
  startY: number;
}

interface TapZoomSequence {
  count: number;
  lastTapAt: number;
  timer: ReturnType<typeof setTimeout> | null;
}

interface HandleTapZoomParams {
  happenedAt: number;
  point: TapZoomPoint;
}

interface RunTapZoomParams {
  point: TapZoomPoint;
  scale: number;
}

interface ScheduleDoubleTapZoomParams {
  point: TapZoomPoint;
}

interface MapViewerTapZoomTouchHandlers {
  onTouchCancel: (event: GestureResponderEvent) => void;
  onTouchEnd: (event: GestureResponderEvent) => void;
  onTouchMove: (event: GestureResponderEvent) => void;
  onTouchStart: (event: GestureResponderEvent) => void;
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
  const tapZoomCandidateRef = useRef<TapZoomCandidate | null>(null);
  const tapZoomSequenceRef = useRef<TapZoomSequence>({
    count: 0,
    lastTapAt: 0,
    timer: null,
  });

  const clearTapZoomTimer = useCallback(() => {
    const { timer } = tapZoomSequenceRef.current;

    if (timer === null) {
      return;
    }

    clearTimeout(timer);
    tapZoomSequenceRef.current.timer = null;
  }, []);

  const resetTapZoomSequence = useCallback(() => {
    clearTapZoomTimer();
    tapZoomSequenceRef.current.count = 0;
    tapZoomSequenceRef.current.lastTapAt = 0;
  }, [clearTapZoomTimer]);

  const hasPendingTapZoomCandidate = useCallback(() => {
    const candidate = tapZoomCandidateRef.current;

    return (
      candidate !== null &&
      candidate.startedAt - tapZoomSequenceRef.current.lastTapAt <=
        MAP_VIEWER_TAP_ZOOM_DECISION_DELAY
    );
  }, []);

  const scheduleTapZoomSequenceReset = useCallback(() => {
    clearTapZoomTimer();
    tapZoomSequenceRef.current.timer = setTimeout(() => {
      tapZoomSequenceRef.current.timer = null;

      if (hasPendingTapZoomCandidate()) {
        return;
      }

      resetTapZoomSequence();
    }, MAP_VIEWER_TAP_ZOOM_DECISION_DELAY);
  }, [clearTapZoomTimer, hasPendingTapZoomCandidate, resetTapZoomSequence]);

  const runTapZoom = useCallback(
    ({ point, scale }: RunTapZoomParams) => {
      animateViewport({
        animationIdValue: tapZoomAnimationIdValue,
        commitViewport,
        viewport: getTapZoomedViewport({
          bounds: INTERACTIVE_MAP_BOUNDS,
          focalPoint: point,
          layoutSize: layoutSizeValue.value,
          minimumViewportWidth: MINIMUM_INTERACTIVE_VIEWPORT_WIDTH,
          scale,
          viewport: getViewportFromSharedValues({
            viewportValues,
          }),
        }),
        viewportValues,
      });
    },
    [commitViewport, layoutSizeValue, tapZoomAnimationIdValue, viewportValues],
  );

  const scheduleDoubleTapZoom = useCallback(
    ({ point }: ScheduleDoubleTapZoomParams) => {
      clearTapZoomTimer();
      tapZoomSequenceRef.current.timer = setTimeout(() => {
        tapZoomSequenceRef.current.timer = null;

        if (hasPendingTapZoomCandidate()) {
          return;
        }

        if (tapZoomSequenceRef.current.count !== 2) {
          return;
        }

        resetTapZoomSequence();
        runTapZoom({
          point,
          scale: MAP_VIEWER_TAP_ZOOM_SCALE,
        });
      }, MAP_VIEWER_TAP_ZOOM_DECISION_DELAY);
    },
    [
      clearTapZoomTimer,
      hasPendingTapZoomCandidate,
      resetTapZoomSequence,
      runTapZoom,
    ],
  );

  const handleTapZoom = useCallback(
    ({ happenedAt, point }: HandleTapZoomParams) => {
      const hasExpired =
        happenedAt - tapZoomSequenceRef.current.lastTapAt >
        MAP_VIEWER_TAP_ZOOM_DECISION_DELAY;
      const nextTapCount = hasExpired
        ? 1
        : tapZoomSequenceRef.current.count + 1;

      tapZoomSequenceRef.current.count = nextTapCount;
      tapZoomSequenceRef.current.lastTapAt = happenedAt;

      if (nextTapCount === 1) {
        scheduleTapZoomSequenceReset();
        return;
      }

      if (nextTapCount === 2) {
        scheduleDoubleTapZoom({
          point,
        });
        return;
      }

      resetTapZoomSequence();
      runTapZoom({
        point,
        scale: 1 / MAP_VIEWER_TAP_ZOOM_SCALE,
      });
    },
    [
      resetTapZoomSequence,
      runTapZoom,
      scheduleDoubleTapZoom,
      scheduleTapZoomSequenceReset,
    ],
  );

  const cancelTapZoomCandidate = useCallback(() => {
    tapZoomCandidateRef.current = null;
    resetTapZoomSequence();
  }, [resetTapZoomSequence]);

  const tapZoomTouchHandlers = useMemo<MapViewerTapZoomTouchHandlers>(
    () => ({
      onTouchCancel: () => {
        cancelTapZoomCandidate();
      },
      onTouchEnd: (event) => {
        const candidate = tapZoomCandidateRef.current;
        tapZoomCandidateRef.current = null;

        if (!isInteractive) {
          return;
        }

        if (candidate === null) {
          return;
        }

        if (candidate.hasMoved) {
          resetTapZoomSequence();
          return;
        }

        if (event.nativeEvent.touches.length > 0) {
          resetTapZoomSequence();
          return;
        }

        const [changedTouch] = event.nativeEvent.changedTouches;

        if (changedTouch === undefined) {
          resetTapZoomSequence();
          return;
        }

        handleTapZoom({
          happenedAt: candidate.startedAt,
          point: {
            x: changedTouch.locationX,
            y: changedTouch.locationY,
          },
        });
      },
      onTouchMove: (event) => {
        const candidate = tapZoomCandidateRef.current;

        if (candidate === null) {
          return;
        }

        if (!isInteractive) {
          tapZoomCandidateRef.current = null;
          return;
        }

        if (event.nativeEvent.touches.length !== 1) {
          candidate.hasMoved = true;
          resetTapZoomSequence();
          return;
        }

        const [touch] = event.nativeEvent.touches;

        if (touch === undefined) {
          candidate.hasMoved = true;
          resetTapZoomSequence();
          return;
        }

        const translationX = touch.locationX - candidate.startX;
        const translationY = touch.locationY - candidate.startY;
        const distanceSquared =
          translationX * translationX + translationY * translationY;

        if (distanceSquared <= MAP_VIEWER_TAP_ZOOM_MAX_DISTANCE_SQUARED) {
          return;
        }

        candidate.hasMoved = true;
      },
      onTouchStart: (event) => {
        if (!isInteractive) {
          tapZoomCandidateRef.current = null;
          return;
        }

        if (event.nativeEvent.touches.length !== 1) {
          tapZoomCandidateRef.current = null;
          resetTapZoomSequence();
          return;
        }

        const [touch] = event.nativeEvent.touches;

        if (touch === undefined) {
          tapZoomCandidateRef.current = null;
          resetTapZoomSequence();
          return;
        }

        tapZoomCandidateRef.current = {
          hasMoved: false,
          startedAt: Date.now(),
          startX: touch.locationX,
          startY: touch.locationY,
        };
      },
    }),
    [
      cancelTapZoomCandidate,
      handleTapZoom,
      isInteractive,
      resetTapZoomSequence,
    ],
  );

  useEffect(() => {
    gestureStateValue.value = null;
    hasGestureMovedValue.value = false;
    tapZoomAnimationIdValue.value += 1;
    tapZoomCandidateRef.current = null;
    resetTapZoomSequence();
  }, [
    gestureStateValue,
    hasGestureMovedValue,
    isInteractive,
    resetTapZoomSequence,
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
      .maxPointers(1)
      .minDistance(MAP_VIEWER_TAP_ZOOM_MAX_DISTANCE)
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
    tapZoomTouchHandlers,
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
  cancelAnimation(viewportValues.height);
  cancelAnimation(viewportValues.width);
  cancelAnimation(viewportValues.x);
  cancelAnimation(viewportValues.y);
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
