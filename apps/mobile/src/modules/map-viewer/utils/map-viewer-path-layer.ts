import type { SkPath } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

export interface MapViewerPathGroup {
  backgroundColor: string;
  borderColor: string;
  id: string;
  path: SkPath;
}

export interface MapViewerPathLayer {
  basePath: SkPath | null;
  highlightPathGroups: readonly MapViewerPathGroup[];
}

export interface MapViewerRenderedPathLayer extends MapViewerPathLayer {
  id: string;
  opacity: SharedValue<number>;
}
