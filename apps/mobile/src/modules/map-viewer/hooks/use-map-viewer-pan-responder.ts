import { useCallback, useMemo } from "react";
import type { RefObject } from "react";
import { PanResponder } from "react-native";

import {
  buildMapGestureState,
  buildPinchMapGestureState,
  getPannedViewport,
  getPinchedViewport,
  getTouchDistance,
  getTouchPair,
  type MapGestureState,
} from "../utils/map-viewer-gestures";
import type { LayoutSize, MapViewport } from "../utils/map-viewer-viewport";

interface UseMapViewerPanResponderParams {
  applyViewport: (viewport: MapViewport) => void;
  gestureStateRef: RefObject<MapGestureState | null>;
  isInteractive: boolean;
  layoutSize: LayoutSize;
  onInteractionEnd?: () => void;
  onInteractionStart?: () => void;
  viewportRef: RefObject<MapViewport>;
}

export function useMapViewerPanResponder({
  applyViewport,
  gestureStateRef,
  isInteractive,
  layoutSize,
  onInteractionEnd,
  onInteractionStart,
  viewportRef,
}: UseMapViewerPanResponderParams) {
  const handleInteractionStart = useCallback(() => {
    if (!isInteractive) {
      return;
    }

    onInteractionStart?.();
  }, [isInteractive, onInteractionStart]);

  const handleInteractionEnd = useCallback(() => {
    if (!isInteractive) {
      return;
    }

    onInteractionEnd?.();
  }, [isInteractive, onInteractionEnd]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => isInteractive,
        onMoveShouldSetPanResponderCapture: () => isInteractive,
        onPanResponderTerminationRequest: () => false,
        onStartShouldSetPanResponder: () => isInteractive,
        onStartShouldSetPanResponderCapture: () => isInteractive,
        onPanResponderGrant: (event) => {
          handleInteractionStart();
          gestureStateRef.current = buildMapGestureState({
            layoutSize,
            touches: event.nativeEvent.touches,
            viewport: viewportRef.current,
          });
        },
        onPanResponderMove: (event, gestureState) => {
          const touchPair = getTouchPair({
            touches: event.nativeEvent.touches,
          });

          if (touchPair !== null) {
            const currentGestureState = gestureStateRef.current;
            const pinchGestureState =
              currentGestureState?.type === "pinch"
                ? currentGestureState
                : buildPinchMapGestureState({
                    layoutSize,
                    touches: event.nativeEvent.touches,
                    viewport: viewportRef.current,
                  });

            if (pinchGestureState === null) {
              return;
            }

            gestureStateRef.current = pinchGestureState;
            applyViewport(
              getPinchedViewport({
                currentDistance: getTouchDistance(touchPair),
                gestureState: pinchGestureState,
              }),
            );
            return;
          }

          const currentGestureState = gestureStateRef.current;

          if (currentGestureState === null) {
            gestureStateRef.current = {
              type: "pan",
              viewport: viewportRef.current,
            };
            return;
          }

          if (currentGestureState.type !== "pan") {
            gestureStateRef.current = {
              type: "pan",
              viewport: viewportRef.current,
            };
            return;
          }

          applyViewport(
            getPannedViewport({
              gestureState,
              layoutSize,
              viewport: currentGestureState.viewport,
            }),
          );
        },
        onPanResponderRelease: () => {
          gestureStateRef.current = null;
          handleInteractionEnd();
        },
        onPanResponderTerminate: () => {
          gestureStateRef.current = null;
          handleInteractionEnd();
        },
        onShouldBlockNativeResponder: () => isInteractive,
      }),
    [
      applyViewport,
      gestureStateRef,
      handleInteractionEnd,
      handleInteractionStart,
      isInteractive,
      layoutSize,
      viewportRef,
    ],
  );

  return {
    panResponder,
  };
}
