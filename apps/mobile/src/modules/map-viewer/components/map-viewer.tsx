import { Button } from "heroui-native/button";
import { cn } from "heroui-native/utils";
import { RotateCcw } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { ThemedIcon } from "@/services/theme/themed-icon";

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
const RESET_BUTTON_FADE_DURATION = 160;
const RESET_BUTTON_FADE_IN = FadeIn.duration(RESET_BUTTON_FADE_DURATION);
const RESET_BUTTON_FADE_OUT = FadeOut.duration(RESET_BUTTON_FADE_DURATION);

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
  const { t } = useTranslation();
  const gestureStateRef = useRef<MapGestureState | null>(null);
  const {
    applyViewport,
    handleLayout,
    hasViewportBeenUpdated,
    layoutSize,
    resetViewport,
    viewport,
    viewportRef,
  } = useMapViewerViewport({
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
        "relative h-55 overflow-hidden rounded-lg border border-default bg-map-background",
        className,
      )}
      onLayout={handleLayout}
    >
      <View
        className="h-full w-full"
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
      {isInteractive && hasViewportBeenUpdated && (
        <Animated.View
          className="absolute bottom-3 right-3 z-10"
          entering={RESET_BUTTON_FADE_IN}
          exiting={RESET_BUTTON_FADE_OUT}
        >
          <Button
            aria-label={t("map-viewer.reset")}
            isIconOnly
            size="sm"
            variant="tertiary"
            onPress={resetViewport}
          >
            <ThemedIcon
              colorClassName="text-default-foreground"
              icon={RotateCcw}
              size={18}
            />
          </Button>
        </Animated.View>
      )}
    </View>
  );
}
