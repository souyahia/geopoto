import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { MapViewer } from "@/modules/map-viewer/components/map-viewer";
import type { MapViewerHighlightTarget } from "@/modules/map-viewer/utils/map-viewer-viewport";

import { LearnHeader } from "../components/learn-header";

const LEARN_MAP_WORLD_TARGET: MapViewerHighlightTarget = {
  region: "world",
  type: "region",
};

const LEARN_MAP_ACTIVE_TARGETS: readonly MapViewerHighlightTarget[] = [
  LEARN_MAP_WORLD_TARGET,
];

export function LearnMapPage() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={t("learn.menu-cards.map.title")} />
      <MapViewer
        activeTargets={LEARN_MAP_ACTIVE_TARGETS}
        centersOn={LEARN_MAP_WORLD_TARGET}
        className="flex-1 rounded-none border-0"
        isInteractive
      />
    </View>
  );
}
