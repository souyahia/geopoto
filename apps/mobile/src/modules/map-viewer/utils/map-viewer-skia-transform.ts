import type { Transforms3d } from "@shopify/react-native-skia";

import type { LayoutSize, MapViewport } from "./map-viewer-viewport";

interface GetMapViewerSkiaTransformParams {
  layoutSize: LayoutSize;
  viewport: MapViewport;
}

export function getMapViewerSkiaTransform({
  layoutSize,
  viewport,
}: GetMapViewerSkiaTransformParams): Transforms3d {
  "worklet";

  const scaleX =
    Math.max(layoutSize.width, 1) / Math.max(viewport.width, Number.EPSILON);
  const scaleY =
    Math.max(layoutSize.height, 1) / Math.max(viewport.height, Number.EPSILON);
  const translateX = -viewport.x * scaleX;
  const translateY = -viewport.y * scaleY;

  return [{ translateX }, { translateY }, { scaleX }, { scaleY }];
}
