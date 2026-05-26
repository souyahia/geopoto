import {
  Canvas,
  DashPathEffect,
  Group,
  Path,
} from "@shopify/react-native-skia";
import type { Transforms3d } from "@shopify/react-native-skia";
import { View } from "react-native";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

import type {
  MapViewerPathGroup,
  MapViewerRenderedPathLayer,
} from "../utils/map-viewer-path-layer";

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
  const countryPressAreaBorderDashIntervals = useDerivedValue(() => [
    strokeWidth.value * 4,
    strokeWidth.value * 3,
  ]);

  return (
    <View className="h-full w-full">
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Group transform={mapTransform}>
          {pathLayers.map(
            ({
              activePathGroups,
              basePath,
              countryPressAreaPathGroups,
              highlightPathGroups,
              id: layerId,
              opacity,
              topCountryPathGroups,
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
                {activePathGroups.map((group) => (
                  <Group key={`active:${group.id}`}>
                    <Path
                      color={getPathGroupBackgroundColor({
                        activeCountryBackgroundColor,
                        group,
                        highlightBackgroundColor,
                      })}
                      path={group.path}
                      style="fill"
                    />
                    <Path
                      color={getPathGroupBorderColor({
                        activeCountryBorderColor,
                        group,
                        highlightBorderColor,
                      })}
                      path={group.path}
                      strokeJoin="round"
                      strokeWidth={strokeWidth}
                      style="stroke"
                    />
                  </Group>
                ))}
                {highlightPathGroups.map((group) => (
                  <Group key={`highlight:${group.id}`}>
                    <Path
                      color={getPathGroupBackgroundColor({
                        activeCountryBackgroundColor,
                        group,
                        highlightBackgroundColor,
                      })}
                      path={group.path}
                      style="fill"
                    />
                    <Path
                      color={getPathGroupBorderColor({
                        activeCountryBorderColor,
                        group,
                        highlightBorderColor,
                      })}
                      path={group.path}
                      strokeJoin="round"
                      strokeWidth={strokeWidth}
                      style="stroke"
                    />
                  </Group>
                ))}
                {countryPressAreaPathGroups.map((group) => (
                  <Group key={`country-press-area:${group.id}`}>
                    <Path
                      color={getPathGroupBackgroundColor({
                        activeCountryBackgroundColor,
                        group,
                        highlightBackgroundColor,
                      })}
                      opacity={0.5}
                      path={group.path}
                      style="fill"
                    />
                    <Path
                      color={getPathGroupBorderColor({
                        activeCountryBorderColor,
                        group,
                        highlightBorderColor,
                      })}
                      path={group.path}
                      strokeJoin="round"
                      strokeWidth={strokeWidth}
                      style="stroke"
                    >
                      <DashPathEffect
                        intervals={countryPressAreaBorderDashIntervals}
                      />
                    </Path>
                  </Group>
                ))}
                {topCountryPathGroups.map((group) => (
                  <Group key={`top-country:${group.id}`}>
                    <Path
                      color={getPathGroupBackgroundColor({
                        activeCountryBackgroundColor,
                        group,
                        highlightBackgroundColor,
                      })}
                      path={group.path}
                      style="fill"
                    />
                    <Path
                      color={getPathGroupBorderColor({
                        activeCountryBorderColor,
                        group,
                        highlightBorderColor,
                      })}
                      path={group.path}
                      strokeJoin="round"
                      strokeWidth={strokeWidth}
                      style="stroke"
                    />
                  </Group>
                ))}
              </Group>
            ),
          )}
        </Group>
      </Canvas>
    </View>
  );
}

interface GetPathGroupBackgroundColorParams {
  activeCountryBackgroundColor: string;
  group: MapViewerPathGroup;
  highlightBackgroundColor: string;
}

function getPathGroupBackgroundColor({
  activeCountryBackgroundColor,
  group,
  highlightBackgroundColor,
}: GetPathGroupBackgroundColorParams): string {
  if (group.backgroundColor !== undefined) {
    return group.backgroundColor;
  }

  if (group.visualState === "highlighted") {
    return highlightBackgroundColor;
  }

  return activeCountryBackgroundColor;
}

interface GetPathGroupBorderColorParams {
  activeCountryBorderColor: string;
  group: MapViewerPathGroup;
  highlightBorderColor: string;
}

function getPathGroupBorderColor({
  activeCountryBorderColor,
  group,
  highlightBorderColor,
}: GetPathGroupBorderColorParams): string {
  if (group.borderColor !== undefined) {
    return group.borderColor;
  }

  if (group.visualState === "highlighted") {
    return highlightBorderColor;
  }

  return activeCountryBorderColor;
}
