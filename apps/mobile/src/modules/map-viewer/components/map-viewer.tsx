import { cn } from "heroui-native/utils";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";

import { NativeBackGestureShield } from "@/components/native-back-gesture-shield";

import { useMapViewerGesture } from "../hooks/use-map-viewer-gesture";
import { useMapViewerSkiaPresentation } from "../hooks/use-map-viewer-skia-presentation";
import {
  type MapViewerHighlight,
  useMapViewerStyles,
} from "../hooks/use-map-viewer-styles";
import { useMapViewerViewport } from "../hooks/use-map-viewer-viewport";
import type { MapViewerCenterTarget } from "../utils/map-viewer-viewport";
import { MapViewerCanvas } from "./map-viewer-canvas";
import { MapViewerResetButton } from "./map-viewer-reset-button";

const DEFAULT_LAYOUT_SIZE = {
  height: 220,
  width: 360,
};
const EMPTY_MAP_VIEWER_HIGHLIGHTS: readonly MapViewerHighlight[] = [];

export interface MapViewerProps {
  centersOn: MapViewerCenterTarget;
  className?: string;
  highlights?: readonly MapViewerHighlight[];
  isInteractive?: boolean;
}

export function MapViewer({
  centersOn,
  className,
  highlights = EMPTY_MAP_VIEWER_HIGHLIGHTS,
  isInteractive = true,
}: MapViewerProps) {
  const {
    commitViewport,
    handleLayout,
    hasViewportBeenUpdated,
    layoutSize,
    resetViewport,
    viewport,
  } = useMapViewerViewport({
    centersOn,
    defaultLayoutSize: DEFAULT_LAYOUT_SIZE,
  });

  const {
    highlightStrokeWidth,
    layoutSizeValue,
    mapTransform,
    strokeWidth,
    viewportValues,
  } = useMapViewerSkiaPresentation({
    layoutSize,
    viewport,
  });

  const {
    basePath,
    countryBackgroundColor,
    countryBorderColor,
    highlightPathGroups,
  } = useMapViewerStyles({
    highlights,
  });

  const { gesture } = useMapViewerGesture({
    commitViewport,
    isInteractive,
    layoutSizeValue,
    viewport,
    viewportValues,
  });

  return (
    <View
      className={cn(
        "relative h-55 overflow-hidden rounded-lg border border-default bg-map-background",
        className,
      )}
      onLayout={handleLayout}
    >
      <NativeBackGestureShield
        contentWidth={layoutSize.width}
        isEnabled={isInteractive}
      >
        <GestureDetector gesture={gesture}>
          <View collapsable={false} className="h-full w-full">
            <MapViewerCanvas
              basePath={basePath}
              countryBackgroundColor={countryBackgroundColor}
              countryBorderColor={countryBorderColor}
              highlightPathGroups={highlightPathGroups}
              highlightStrokeWidth={highlightStrokeWidth}
              mapTransform={mapTransform}
              strokeWidth={strokeWidth}
            />
          </View>
        </GestureDetector>
      </NativeBackGestureShield>
      <MapViewerResetButton
        isVisible={isInteractive && hasViewportBeenUpdated}
        onPress={resetViewport}
      />
    </View>
  );
}
