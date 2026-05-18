import { cn } from "heroui-native/utils";
import { useRef } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useMapViewerPanResponder } from "../hooks/use-map-viewer-pan-responder";
import {
  type MapViewerHighlight,
  useMapViewerStyles,
} from "../hooks/use-map-viewer-styles";
import { useMapViewerViewport } from "../hooks/use-map-viewer-viewport";
import type { MapGestureState } from "../utils/map-viewer-gestures";
import type { MapViewerCenterTarget } from "../utils/map-viewer-viewport";

const DEFAULT_LAYOUT_SIZE = {
  height: 220,
  width: 360,
};

export interface MapViewerProps {
  centersOn: MapViewerCenterTarget;
  className?: string;
  highlights?: readonly MapViewerHighlight[];
  isInteractive?: boolean;
  onInteractionEnd?: () => void;
  onInteractionStart?: () => void;
}

export function MapViewer({
  centersOn,
  className,
  highlights = [],
  isInteractive = true,
  onInteractionEnd,
  onInteractionStart,
}: MapViewerProps) {
  const gestureStateRef = useRef<MapGestureState | null>(null);
  const { applyViewport, handleLayout, layoutSize, viewport, viewportRef } =
    useMapViewerViewport({
      centersOn,
      defaultLayoutSize: DEFAULT_LAYOUT_SIZE,
      gestureStateRef,
    });
  const { countryStyles } = useMapViewerStyles({
    highlights,
    layoutSize,
    viewport,
  });
  const { panResponder } = useMapViewerPanResponder({
    applyViewport,
    gestureStateRef,
    isInteractive,
    layoutSize,
    onInteractionEnd,
    onInteractionStart,
    viewportRef,
  });

  return (
    <View
      className={cn(
        "h-55 overflow-hidden rounded-lg border border-default bg-map-background",
        className,
      )}
      onLayout={handleLayout}
      {...(isInteractive ? panResponder.panHandlers : {})}
    >
      <Svg
        height="100%"
        viewBox={`${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`}
        width="100%"
      >
        {countryStyles.map(
          ({ backgroundColor, borderColor, borderWidth, country }) => (
            <Path
              d={country.map.path}
              fill={backgroundColor}
              key={country.code}
              stroke={borderColor}
              strokeLinejoin="round"
              strokeWidth={borderWidth}
            />
          ),
        )}
      </Svg>
    </View>
  );
}
