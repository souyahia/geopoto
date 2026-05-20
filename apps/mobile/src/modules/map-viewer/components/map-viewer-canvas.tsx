import { Canvas, Group, Path } from "@shopify/react-native-skia";
import type { SkPath, Transforms3d } from "@shopify/react-native-skia";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

interface MapViewerCanvasPathGroup {
  backgroundColor: string;
  borderColor: string;
  id: string;
  path: SkPath;
}

interface MapViewerCanvasProps {
  basePath: SkPath | null;
  countryBackgroundColor: string;
  countryBorderColor: string;
  highlightPathGroups: readonly MapViewerCanvasPathGroup[];
  highlightStrokeWidth: SharedValue<number>;
  mapTransform: SharedValue<Transforms3d>;
  strokeWidth: SharedValue<number>;
}

export function MapViewerCanvas({
  basePath,
  countryBackgroundColor,
  countryBorderColor,
  highlightPathGroups,
  highlightStrokeWidth,
  mapTransform,
  strokeWidth,
}: MapViewerCanvasProps) {
  return (
    <View className="h-full w-full">
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Group transform={mapTransform}>
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
            ({ backgroundColor, borderColor, id, path }) => (
              <Group key={id}>
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
      </Canvas>
    </View>
  );
}
