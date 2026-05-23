import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { CountryMapPathResolution } from "@geopoto/geo-data";

import type {
  MapViewerPathLayer,
  MapViewerRenderedPathLayer,
} from "../utils/map-viewer-path-layer";

interface UseMapViewerPathResolutionTransitionParams {
  currentLayer: MapViewerPathLayer;
  pathResolution: CountryMapPathResolution;
}

interface MapViewerPathResolutionTransitionState {
  currentLayer: MapViewerPathLayer;
  pathResolution: CountryMapPathResolution;
  previousLayer: MapViewerPathLayer | null;
}

const MAP_VIEWER_PATH_RESOLUTION_TRANSITION_DURATION = 120;

export function useMapViewerPathResolutionTransition({
  currentLayer,
  pathResolution,
}: UseMapViewerPathResolutionTransitionParams): readonly MapViewerRenderedPathLayer[] {
  const currentOpacity = useSharedValue(1);
  const previousOpacity = useSharedValue(0);
  const previousPathResolutionRef = useRef(pathResolution);
  const previousLayerRef = useRef(currentLayer);
  const [transitionState, setTransitionState] =
    useState<MapViewerPathResolutionTransitionState>(() => ({
      currentLayer,
      pathResolution,
      previousLayer: null,
    }));

  const clearPreviousLayer = useCallback(() => {
    setTransitionState((state) => ({
      ...state,
      previousLayer: null,
    }));
  }, []);

  const syncCurrentLayer = useCallback(
    (nextCurrentLayer: MapViewerPathLayer) => {
      setTransitionState((state) => {
        const isSameCurrentLayer = state.currentLayer === nextCurrentLayer;
        const isSamePathResolution = state.pathResolution === pathResolution;

        if (isSameCurrentLayer && isSamePathResolution) {
          return state;
        }

        return {
          ...state,
          currentLayer: nextCurrentLayer,
          pathResolution,
        };
      });
    },
    [pathResolution],
  );

  useLayoutEffect(() => {
    const isSamePathResolution =
      previousPathResolutionRef.current === pathResolution;

    if (isSamePathResolution) {
      previousLayerRef.current = currentLayer;
      syncCurrentLayer(currentLayer);
      return;
    }

    const nextPreviousLayer = previousLayerRef.current;
    previousPathResolutionRef.current = pathResolution;
    previousLayerRef.current = currentLayer;
    setTransitionState({
      currentLayer,
      pathResolution,
      previousLayer: nextPreviousLayer,
    });
    previousOpacity.value = 1;
    previousOpacity.value = withTiming(
      0,
      {
        duration: MAP_VIEWER_PATH_RESOLUTION_TRANSITION_DURATION,
      },
      (isFinished) => {
        if (isFinished) {
          scheduleOnRN(clearPreviousLayer);
        }
      },
    );
  }, [
    clearPreviousLayer,
    currentLayer,
    pathResolution,
    previousOpacity,
    syncCurrentLayer,
  ]);

  return useMemo(() => {
    const currentRenderedLayer = {
      ...transitionState.currentLayer,
      id: `current:${transitionState.pathResolution}`,
      opacity: currentOpacity,
    };

    if (transitionState.previousLayer === null) {
      return [currentRenderedLayer];
    }

    return [
      currentRenderedLayer,
      {
        ...transitionState.previousLayer,
        id: `previous:${transitionState.pathResolution}`,
        opacity: previousOpacity,
      },
    ];
  }, [currentOpacity, previousOpacity, transitionState]);
}
