import { useCallback, useEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

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
}

export function useMapViewerViewport({
  centersOn,
  defaultLayoutSize,
}: UseMapViewerViewportParams) {
  const [layoutSize, setLayoutSize] = useState(defaultLayoutSize);
  const aspectRatio =
    Math.max(layoutSize.width, 1) / Math.max(layoutSize.height, 1);
  const [viewport, setViewport] = useState(() =>
    buildInitialViewport({ aspectRatio, centersOn }),
  );
  const initialViewportRef = useRef(viewport);
  const [hasViewportBeenUpdated, setHasViewportBeenUpdated] = useState(false);
  const hasViewportBeenUpdatedRef = useRef(false);
  const resetSignature = `${getMapViewerCenterTargetKey(centersOn)}:${aspectRatio}`;
  const resetSignatureRef = useRef(resetSignature);

  const setCurrentViewport = useCallback((nextViewport: MapViewport) => {
    setViewport(nextViewport);
  }, []);

  const setViewportBeenUpdated = useCallback((hasBeenUpdated: boolean) => {
    hasViewportBeenUpdatedRef.current = hasBeenUpdated;
    setHasViewportBeenUpdated(hasBeenUpdated);
  }, []);

  const markViewportBeenUpdated = useCallback(() => {
    if (hasViewportBeenUpdatedRef.current) {
      return;
    }

    setViewportBeenUpdated(true);
  }, [setViewportBeenUpdated]);

  const commitViewport = useCallback(
    (nextViewport: MapViewport) => {
      setCurrentViewport(nextViewport);
      markViewportBeenUpdated();
    },
    [markViewportBeenUpdated, setCurrentViewport],
  );

  const resetViewport = useCallback(() => {
    setCurrentViewport(initialViewportRef.current);
    setViewportBeenUpdated(false);
  }, [setCurrentViewport, setViewportBeenUpdated]);

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
    const nextInitialViewport = buildInitialViewport({
      aspectRatio,
      centersOn,
    });

    initialViewportRef.current = nextInitialViewport;
    setCurrentViewport(nextInitialViewport);
    setViewportBeenUpdated(false);
  }, [
    aspectRatio,
    centersOn,
    resetSignature,
    setCurrentViewport,
    setViewportBeenUpdated,
  ]);

  return {
    commitViewport,
    handleLayout,
    hasViewportBeenUpdated,
    layoutSize,
    resetViewport,
    viewport,
  };
}
