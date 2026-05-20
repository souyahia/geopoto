import type { Transforms3d } from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { getMapViewerSkiaTransform } from "../utils/map-viewer-skia-transform";
import type { LayoutSize, MapViewport } from "../utils/map-viewer-viewport";

interface UseMapViewerSkiaPresentationParams {
  layoutSize: LayoutSize;
  viewport: MapViewport;
}

interface MapViewerSkiaPresentation {
  highlightStrokeWidth: SharedValue<number>;
  layoutSizeValue: SharedValue<LayoutSize>;
  mapTransform: SharedValue<Transforms3d>;
  strokeWidth: SharedValue<number>;
  viewportValues: MapViewerViewportSharedValues;
}

export interface MapViewerViewportSharedValues {
  height: SharedValue<number>;
  width: SharedValue<number>;
  x: SharedValue<number>;
  y: SharedValue<number>;
}

export function useMapViewerSkiaPresentation({
  layoutSize,
  viewport,
}: UseMapViewerSkiaPresentationParams): MapViewerSkiaPresentation {
  const layoutSizeValue = useSharedValue(layoutSize);
  const viewportX = useSharedValue(viewport.x);
  const viewportY = useSharedValue(viewport.y);
  const viewportWidth = useSharedValue(viewport.width);
  const viewportHeight = useSharedValue(viewport.height);
  const viewportValues = useMemo(
    () => ({
      height: viewportHeight,
      width: viewportWidth,
      x: viewportX,
      y: viewportY,
    }),
    [viewportHeight, viewportWidth, viewportX, viewportY],
  );
  const mapTransform = useDerivedValue(() =>
    getMapViewerSkiaTransform({
      layoutSize: layoutSizeValue.value,
      viewport: {
        height: viewportValues.height.value,
        width: viewportValues.width.value,
        x: viewportValues.x.value,
        y: viewportValues.y.value,
      },
    }),
  );
  const strokeWidth = useDerivedValue(() =>
    Math.max(
      viewportValues.width.value / Math.max(layoutSizeValue.value.width, 1),
      0.08,
    ),
  );
  const highlightStrokeWidth = useDerivedValue(() => strokeWidth.value * 2);

  useEffect(() => {
    layoutSizeValue.value = layoutSize;
    viewportValues.height.value = viewport.height;
    viewportValues.width.value = viewport.width;
    viewportValues.x.value = viewport.x;
    viewportValues.y.value = viewport.y;
  }, [layoutSize, layoutSizeValue, viewport, viewportValues]);

  return {
    highlightStrokeWidth,
    layoutSizeValue,
    mapTransform,
    strokeWidth,
    viewportValues,
  };
}
