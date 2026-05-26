import type { Transforms3d } from "@shopify/react-native-skia";
import { useIsFocused } from "expo-router";
import { cn } from "heroui-native/utils";
import { useMemo } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { Uniwind } from "uniwind";

import { NativeBackGestureShield } from "@/components/native-back-gesture-shield";
import { useAppTheme } from "@/services/theme/theme";

import { useMapViewerColors } from "../hooks/use-map-viewer-colors";
import { useMapViewerGesture } from "../hooks/use-map-viewer-gesture";
import { useMapViewerPathResolutionTransition } from "../hooks/use-map-viewer-path-resolution-transition";
import { useMapViewerSkiaPresentation } from "../hooks/use-map-viewer-skia-presentation";
import {
  type MapViewerHighlight,
  useMapViewerStyles,
} from "../hooks/use-map-viewer-styles";
import { useMapViewerViewport } from "../hooks/use-map-viewer-viewport";
import type { MapViewerRenderedPathLayer } from "../utils/map-viewer-path-layer";
import {
  getMapViewerPathResolution,
  type MapViewerCenterTarget,
  type MapViewerHighlightTarget,
} from "../utils/map-viewer-viewport";
import { MapViewerCanvas } from "./map-viewer-canvas";
import { MapViewerResetButton } from "./map-viewer-reset-button";

const DEFAULT_LAYOUT_SIZE = {
  height: 220,
  width: 360,
};
const EMPTY_MAP_VIEWER_ACTIVE_TARGETS: readonly MapViewerHighlightTarget[] = [];
const EMPTY_MAP_VIEWER_HIGHLIGHTS: readonly MapViewerHighlight[] = [];

export interface MapViewerProps {
  activeTargets?: readonly MapViewerHighlightTarget[];
  centersOn: MapViewerCenterTarget;
  className?: string;
  highlights?: readonly MapViewerHighlight[];
  isInteractive?: boolean;
}

export function MapViewer({
  activeTargets = EMPTY_MAP_VIEWER_ACTIVE_TARGETS,
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
  const pathResolution = getMapViewerPathResolution({
    viewport,
  });

  const { layoutSizeValue, mapTransform, strokeWidth, viewportValues } =
    useMapViewerSkiaPresentation({
      layoutSize,
      viewport,
    });

  const {
    activePathGroups,
    basePath,
    countryPressAreaPathGroups,
    highlightPathGroups,
    topCountryPathGroups,
  } = useMapViewerStyles({
    activeTargets,
    highlights,
    pathResolution,
  });
  const currentPathLayer = useMemo(
    () => ({
      activePathGroups,
      basePath,
      countryPressAreaPathGroups,
      highlightPathGroups,
      topCountryPathGroups,
    }),
    [
      activePathGroups,
      basePath,
      countryPressAreaPathGroups,
      highlightPathGroups,
      topCountryPathGroups,
    ],
  );
  const pathLayers = useMapViewerPathResolutionTransition({
    currentLayer: currentPathLayer,
    pathResolution,
  });

  const { gesture, tapZoomTouchHandlers } = useMapViewerGesture({
    commitViewport,
    isInteractive,
    layoutSizeValue,
    viewport,
    viewportValues,
  });
  const mapViewerColorKey = useMapViewerColorKey();

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
          <View
            collapsable={false}
            className="h-full w-full"
            onTouchCancel={tapZoomTouchHandlers.onTouchCancel}
            onTouchEnd={tapZoomTouchHandlers.onTouchEnd}
            onTouchMove={tapZoomTouchHandlers.onTouchMove}
            onTouchStart={tapZoomTouchHandlers.onTouchStart}
            pointerEvents={isInteractive ? "box-only" : "none"}
          >
            <MapViewerThemedCanvas
              key={mapViewerColorKey}
              mapTransform={mapTransform}
              pathLayers={pathLayers}
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

interface MapViewerThemedCanvasProps {
  mapTransform: SharedValue<Transforms3d>;
  pathLayers: readonly MapViewerRenderedPathLayer[];
  strokeWidth: SharedValue<number>;
}

function MapViewerThemedCanvas({
  mapTransform,
  pathLayers,
  strokeWidth,
}: MapViewerThemedCanvasProps) {
  const mapViewerColors = useMapViewerColors();

  return (
    <MapViewerCanvas
      activeCountryBackgroundColor={
        mapViewerColors.activeCountryBackgroundColor
      }
      activeCountryBorderColor={mapViewerColors.activeCountryBorderColor}
      countryBackgroundColor={mapViewerColors.countryBackgroundColor}
      countryBorderColor={mapViewerColors.countryBorderColor}
      highlightBackgroundColor={mapViewerColors.highlightBackgroundColor}
      highlightBorderColor={mapViewerColors.highlightBorderColor}
      mapTransform={mapTransform}
      pathLayers={pathLayers}
      strokeWidth={strokeWidth}
    />
  );
}

function useMapViewerColorKey(): string {
  const isFocused = useIsFocused();
  const { theme } = useAppTheme();
  const focusKey = isFocused ? "focused" : "blurred";

  return `${theme}:${Uniwind.currentTheme}:${focusKey}`;
}
