import { Canvas, Group, Path } from "@shopify/react-native-skia";
import type { Transforms3d } from "@shopify/react-native-skia";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import type { MapViewerRenderedPathLayer } from "../utils/map-viewer-path-layer";

interface MapViewerCanvasProps {
  activeCountryBackgroundColor: string;
  activeCountryBorderColor: string;
  countryBackgroundColor: string;
  countryBorderColor: string;
  highlightBackgroundColor: string;
  highlightBorderColor: string;
  mapTransform: SharedValue<Transforms3d>;
  pathLayers: readonly MapViewerRenderedPathLayer[];
  strokeWidth: SharedValue<number>;
}

export function MapViewerCanvas({
  activeCountryBackgroundColor,
  activeCountryBorderColor,
  countryBackgroundColor,
  countryBorderColor,
  highlightBackgroundColor,
  highlightBorderColor,
  mapTransform,
  pathLayers,
  strokeWidth,
}: MapViewerCanvasProps) {
  return (
    <View className="h-full w-full">
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Group transform={mapTransform}>
          {pathLayers.map(
            ({
              activePathGroups,
              basePath,
              highlightPathGroups,
              id: layerId,
              opacity,
            }) => (
              <Group key={layerId} opacity={opacity}>
                {basePath !== null && (
                  <>
                    <Path
                      color={countryBackgroundColor}
                      path={basePath}
                      style="fill"
                    />
                    <Path
                      color={countryBorderColor}
                      path={basePath}
                      strokeJoin="round"
                      strokeWidth={strokeWidth}
                      style="stroke"
                    />
                  </>
                )}
                {activePathGroups.map(
                  ({ backgroundColor, borderColor, id: groupId, path }) => (
                    <Group key={`active:${groupId}`}>
                      <Path
                        color={backgroundColor ?? activeCountryBackgroundColor}
                        path={path}
                        style="fill"
                      />
                      <Path
                        color={borderColor ?? activeCountryBorderColor}
                        path={path}
                        strokeJoin="round"
                        strokeWidth={strokeWidth}
                        style="stroke"
                      />
                    </Group>
                  ),
                )}
                {highlightPathGroups.map(
                  ({ backgroundColor, borderColor, id: groupId, path }) => (
                    <Group key={`highlight:${groupId}`}>
                      <Path
                        color={backgroundColor ?? highlightBackgroundColor}
                        path={path}
                        style="fill"
                      />
                      <Path
                        color={borderColor ?? highlightBorderColor}
                        path={path}
                        strokeJoin="round"
                        strokeWidth={strokeWidth}
                        style="stroke"
                      />
                    </Group>
                  ),
                )}
              </Group>
            ),
          )}
        </Group>
      </Canvas>
    </View>
  );
}
