import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Country } from "@geopoto/geo-data";

import { MapViewer } from "@/modules/map-viewer/components/map-viewer";
import type {
  MapViewerHighlight,
  MapViewerHighlightTarget,
} from "@/modules/map-viewer/utils/map-viewer-viewport";

import { LearnHeader } from "../components/learn-header";
import { LearnMapCountrySheet } from "../components/learn-map-country-sheet";

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
  const safeAreaInsets = useSafeAreaInsets();
  const [highlightedCountry, setHighlightedCountry] = useState<Country | null>(
    null,
  );
  const [isCountryInfoSheetOpen, setIsCountryInfoSheetOpen] = useState(false);

  const mapContainerStyle = useMemo(
    () => ({
      paddingBottom: safeAreaInsets.bottom,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
    }),
    [safeAreaInsets.bottom, safeAreaInsets.left, safeAreaInsets.right],
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

  const handleCountryPressed = useCallback(
    (country: Country) => {
      if (highlightedCountry?.code === country.code) {
        setHighlightedCountry(null);
        setIsCountryInfoSheetOpen(false);
        return;
      }

      setHighlightedCountry(country);
      setIsCountryInfoSheetOpen(true);
    },
    [highlightedCountry],
  );

  const handleMapReset = useCallback(() => {
    setHighlightedCountry(null);
    setIsCountryInfoSheetOpen(false);
  }, []);

  const handleCountryInfoSheetOpenChange = useCallback((isOpen: boolean) => {
    setIsCountryInfoSheetOpen(isOpen);
  }, []);

  return (
    <View className="flex-1" style={{ paddingTop: safeAreaInsets.top }}>
      <LearnHeader title={t("learn.menu-cards.map.title")} />
      <View className="flex-1">
        <MapViewer
          activeTargets={LEARN_MAP_ACTIVE_TARGETS}
          centersOn={LEARN_MAP_WORLD_TARGET}
          className="flex-1 rounded-none border-0"
          highlights={highlights}
          isInteractive
          mapContainerStyle={mapContainerStyle}
          onCountryPressed={handleCountryPressed}
          onReset={handleMapReset}
          shouldLimitZoomOutToInitialViewport
        />
      </View>
      <LearnMapCountrySheet
        country={highlightedCountry}
        isOpen={isCountryInfoSheetOpen}
        onOpenChange={handleCountryInfoSheetOpenChange}
      />
    </View>
  );
}
