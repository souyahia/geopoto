import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { LayoutChangeEvent } from "react-native";

import type { MapGestureState } from "../utils/map-viewer-gestures";
import {
  buildInitialViewport,
  getMapViewerCenterTargetKey,
  type LayoutSize,
  type MapViewerCenterTarget,
  type MapViewport,
} from "../utils/map-viewer-viewport";

interface UseMapViewerViewportParams {
  centersOn: MapViewerCenterTarget;
  defaultLayoutSize: LayoutSize;
  gestureStateRef: RefObject<MapGestureState | null>;
}

export function useMapViewerViewport({
  centersOn,
  defaultLayoutSize,
  gestureStateRef,
}: UseMapViewerViewportParams) {
  const [layoutSize, setLayoutSize] = useState(defaultLayoutSize);
  const aspectRatio =
    Math.max(layoutSize.width, 1) / Math.max(layoutSize.height, 1);
  const [viewport, setViewport] = useState(() =>
    buildInitialViewport({ aspectRatio, centersOn }),
  );
  const viewportRef = useRef(viewport);
  const resetSignature = `${getMapViewerCenterTargetKey(centersOn)}:${aspectRatio}`;
  const resetSignatureRef = useRef(resetSignature);

  const applyViewport = useCallback((nextViewport: MapViewport) => {
    viewportRef.current = nextViewport;
    setViewport(nextViewport);
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextLayoutSize = {
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    };

    setLayoutSize((currentLayoutSize) => {
      const hasSameLayoutSize =
        currentLayoutSize.height === nextLayoutSize.height &&
        currentLayoutSize.width === nextLayoutSize.width;

      if (hasSameLayoutSize) {
        return currentLayoutSize;
      }

      return nextLayoutSize;
    });
  }, []);

  useEffect(() => {
    if (resetSignatureRef.current === resetSignature) {
      return;
    }

    resetSignatureRef.current = resetSignature;
    gestureStateRef.current = null;
    applyViewport(buildInitialViewport({ aspectRatio, centersOn }));
  }, [applyViewport, aspectRatio, centersOn, gestureStateRef, resetSignature]);

  return {
    applyViewport,
    handleLayout,
    layoutSize,
    viewport,
    viewportRef,
  };
}
