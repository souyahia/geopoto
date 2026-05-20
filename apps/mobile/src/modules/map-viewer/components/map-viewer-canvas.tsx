import { Canvas, Group, Path } from "@shopify/react-native-skia";
import type { Transforms3d } from "@shopify/react-native-skia";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import type { MapViewerRenderedPathLayer } from "../utils/map-viewer-path-layer";

interface MapViewerCanvasProps {
  countryBackgroundColor: string;
  countryBorderColor: string;
  highlightStrokeWidth: SharedValue<number>;
  mapTransform: SharedValue<Transforms3d>;
  pathLayers: readonly MapViewerRenderedPathLayer[];
  strokeWidth: SharedValue<number>;
}

export function MapViewerCanvas({
  countryBackgroundColor,
  countryBorderColor,
  highlightStrokeWidth,
  mapTransform,
  pathLayers,
  strokeWidth,
}: MapViewerCanvasProps) {
  return (
    <View className="h-full w-full">
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Group transform={mapTransform}>
          {pathLayers.map(
            ({ basePath, highlightPathGroups, id: layerId, opacity }) => (
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
                {highlightPathGroups.map(
                  ({ backgroundColor, borderColor, id: groupId, path }) => (
                    <Group key={groupId}>
                      <Path color={backgroundColor} path={path} style="fill" />
                      <Path
                        color={borderColor}
                        path={path}
                        strokeJoin="round"
                        strokeWidth={highlightStrokeWidth}
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
