import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type { Country } from "@geopoto/geo-data";

import { MapViewer } from "@/modules/map-viewer/components/map-viewer";
import type {
  MapViewerHighlight,
  MapViewerHighlightTarget,
} from "@/modules/map-viewer/utils/map-viewer-viewport";

import { LearnHeader } from "../components/learn-header";

const LEARN_MAP_WORLD_TARGET: MapViewerHighlightTarget = {
  region: "world",
  type: "region",
};

const LEARN_MAP_ACTIVE_TARGETS: readonly MapViewerHighlightTarget[] = [
  LEARN_MAP_WORLD_TARGET,
];
const EMPTY_LEARN_MAP_HIGHLIGHTS: readonly MapViewerHighlight[] = [];

export function LearnMapPage() {
  const { t } = useTranslation();
  const [highlightedCountry, setHighlightedCountry] = useState<Country | null>(
    null,
  );
  const highlights = useMemo<readonly MapViewerHighlight[]>(() => {
    if (highlightedCountry === null) {
      return EMPTY_LEARN_MAP_HIGHLIGHTS;
    }

    return [
      {
        target: {
          country: highlightedCountry,
          type: "country",
        },
      },
    ];
  }, [highlightedCountry]);
  const handleCountryPressed = useCallback((country: Country) => {
    setHighlightedCountry((currentCountry) => {
      if (currentCountry?.code === country.code) {
        return null;
      }

      return country;
    });
  }, []);

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={t("learn.menu-cards.map.title")} />
      <MapViewer
        activeTargets={LEARN_MAP_ACTIVE_TARGETS}
        centersOn={LEARN_MAP_WORLD_TARGET}
        className="flex-1 rounded-none border-0"
        highlights={highlights}
        isInteractive
        onCountryPressed={handleCountryPressed}
      />
    </View>
  );
}
