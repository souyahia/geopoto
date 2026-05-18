import { useCallback, useState } from "react";

export function useDisableCountryScroll() {
  const [isMapViewerGestureActive, setIsMapViewerGestureActive] =
    useState(false);

  const handleMapViewerInteractionStart = useCallback(() => {
    setIsMapViewerGestureActive(true);
  }, []);
  const handleMapViewerInteractionEnd = useCallback(() => {
    setIsMapViewerGestureActive(false);
  }, []);

  return {
    isMapViewerGestureActive,
    mapViewerInteractionHandlers: {
      onInteractionEnd: handleMapViewerInteractionEnd,
      onInteractionStart: handleMapViewerInteractionStart,
    },
  };
}
