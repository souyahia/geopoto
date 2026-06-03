import { Text } from "heroui-native/text";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type ViewStyle,
} from "react-native";

import type { SupportedGeoLanguage } from "@geopoto/geo-data";
import {
  COUNTRY_SUMMARIES_BY_NAME,
  type CountrySummary,
} from "@geopoto/geo-data/country-summaries";
import type { CountryFlagColor } from "@geopoto/geo-data/flag-colors";
import { getCountryFlagImage } from "@geopoto/geo-data/flag-images";
import { getCountryFlagThumbnailImage } from "@geopoto/geo-data/flag-thumbnail-images";
import { getCountryFlag } from "@geopoto/geo-data/flags";

import {
  PAGE_CONTENT_MAX_WIDTH,
  PageContent,
} from "@/components/page-content";
import { useGaleriaDarkMode } from "@/services/theme/galeria-dark-mode";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import { FlagColorFilterSelect } from "../components/flag-color-filter-select";
import {
  FLAG_GRID_ITEM_TEXT_HEIGHT,
  FlagGridItem,
  type FlagGridItemData,
} from "../components/flag-grid-item";
import { LearnHeader } from "../components/learn-header";
import { LearnSearchField } from "../components/learn-search-field";
import { filterFlags, type FlagSearchItem } from "../utils/flag-search";

interface FlagListItem extends FlagGridItemData, FlagSearchItem {
  colors: readonly CountryFlagColor[];
}

interface FlagGridMetrics {
  flagFrameHeight: number;
  itemHeight: number;
  itemWidth: number;
  rowHeight: number;
}

interface GetFlagGridMetricsParams {
  screenWidth: number;
}

interface GetFlagListItemsParams {
  countries: readonly CountrySummary[];
  geoLang: SupportedGeoLanguage;
}

interface ToFlagListItemParams {
  country: CountrySummary;
  geoLang: SupportedGeoLanguage;
}

const FLAG_GRID_COLUMNS = 3;
const FLAG_GRID_HORIZONTAL_PADDING = 24;
const FLAG_GRID_COLUMN_GAP = 12;
const FLAG_GRID_ROW_GAP = 18;
const FLAG_GRID_IMAGE_ASPECT_RATIO = 4 / 3;
const FLAG_GRID_INITIAL_ITEMS = 18;
const FLAG_GRID_MAX_BATCH_ITEMS = 24;
const FLAG_GRID_WINDOW_SIZE = 9;
const FLAG_GRID_CONTENT_CONTAINER_STYLE = {
  alignSelf: "center",
  maxWidth: PAGE_CONTENT_MAX_WIDTH,
  paddingBottom: 32,
  paddingHorizontal: FLAG_GRID_HORIZONTAL_PADDING,
  width: "100%",
} satisfies ViewStyle;
const FLAG_GRID_COLUMN_WRAPPER_STYLE = {
  gap: FLAG_GRID_COLUMN_GAP,
};

function getFlagKey(flag: FlagListItem) {
  return flag.code;
}

function getFlagGridMetrics({
  screenWidth,
}: GetFlagGridMetricsParams): FlagGridMetrics {
  const contentWidth = Math.max(
    0,
    screenWidth - FLAG_GRID_HORIZONTAL_PADDING * 2,
  );
  const totalColumnGap =
    FLAG_GRID_COLUMN_GAP * Math.max(0, FLAG_GRID_COLUMNS - 1);
  const itemWidth = Math.max(
    1,
    Math.floor((contentWidth - totalColumnGap) / FLAG_GRID_COLUMNS),
  );
  const flagFrameHeight = Math.round(itemWidth / FLAG_GRID_IMAGE_ASPECT_RATIO);
  const itemHeight = flagFrameHeight + FLAG_GRID_ITEM_TEXT_HEIGHT;

  return {
    flagFrameHeight,
    itemHeight,
    itemWidth,
    rowHeight: itemHeight + FLAG_GRID_ROW_GAP,
  };
}

function getFlagListItems({
  countries,
  geoLang,
}: GetFlagListItemsParams): readonly FlagListItem[] {
  return countries.flatMap((country) => {
    const flag = toFlagListItem({ country, geoLang });

    if (flag === null) {
      return [];
    }

    return [flag];
  });
}

function toFlagListItem({
  country,
  geoLang,
}: ToFlagListItemParams): FlagListItem | null {
  const flag = getCountryFlag(country.code);

  if (flag === null) {
    return null;
  }

  const thumbnailImageSource = getCountryFlagThumbnailImage(country.code);

  if (thumbnailImageSource === null) {
    return null;
  }

  const fullImageSource = getCountryFlagImage(country.code);

  if (fullImageSource === null) {
    return null;
  }

  return {
    code: country.code,
    colors: flag.colors,
    countryName: country.name[geoLang],
    fullImageSource,
    thumbnailImageSource,
  };
}

export function LearnFlagsPage() {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const { enableGaleriaDarkMode, restoreAppColorScheme } = useGaleriaDarkMode();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<FlagListItem>>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<
    readonly CountryFlagColor[]
  >([]);
  const sortedCountries = COUNTRY_SUMMARIES_BY_NAME[geoLang];
  const flagGridMetrics = useMemo(
    () =>
      getFlagGridMetrics({
        screenWidth: Math.min(width, PAGE_CONTENT_MAX_WIDTH),
      }),
    [width],
  );
  const allFlags = useMemo(
    () => getFlagListItems({ countries: sortedCountries, geoLang }),
    [geoLang, sortedCountries],
  );
  const flags = useMemo(
    () => filterFlags({ flags: allFlags, searchQuery, selectedColors }),
    [allFlags, searchQuery, selectedColors],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [searchQuery, selectedColors]);

  const getFlagGridItemLayout = useCallback(
    (_data: ArrayLike<FlagListItem> | null | undefined, index: number) => ({
      index,
      length: flagGridMetrics.rowHeight,
      offset: flagGridMetrics.rowHeight * index,
    }),
    [flagGridMetrics.rowHeight],
  );

  const renderFlagItem = useCallback(
    (props: ListRenderItemInfo<FlagListItem>) => {
      const { item } = props;

      return (
        <View style={{ marginBottom: FLAG_GRID_ROW_GAP }}>
          <FlagGridItem
            accessibilityLabel={t("learn.flags.flag.accessibility-label", {
              country: item.countryName,
            })}
            enableGaleriaDarkMode={enableGaleriaDarkMode}
            flag={item}
            flagFrameHeight={flagGridMetrics.flagFrameHeight}
            itemHeight={flagGridMetrics.itemHeight}
            itemWidth={flagGridMetrics.itemWidth}
            restoreAppColorScheme={restoreAppColorScheme}
          />
        </View>
      );
    },
    [
      flagGridMetrics.flagFrameHeight,
      flagGridMetrics.itemHeight,
      flagGridMetrics.itemWidth,
      enableGaleriaDarkMode,
      restoreAppColorScheme,
      t,
    ],
  );

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={t("learn.flags.title")} />
      <PageContent className="gap-3 px-6 pb-3 pt-4">
        <LearnSearchField
          accessibilityLabel={t("learn.flags.search.label")}
          clearAccessibilityLabel={t("learn.flags.search.clear")}
          onChange={setSearchQuery}
          placeholder={t("learn.flags.search.placeholder")}
          value={searchQuery}
        />
        <FlagColorFilterSelect
          onSelectedColorsChange={setSelectedColors}
          selectedColors={selectedColors}
        />
      </PageContent>
      <FlatList
        ref={listRef}
        ItemSeparatorComponent={null}
        ListEmptyComponent={
          <View className="items-center px-6 py-12">
            <Text type="body" color="muted" align="center">
              {t("learn.flags.empty")}
            </Text>
          </View>
        }
        className="flex-1"
        columnWrapperStyle={FLAG_GRID_COLUMN_WRAPPER_STYLE}
        contentContainerStyle={FLAG_GRID_CONTENT_CONTAINER_STYLE}
        data={flags}
        getItemLayout={getFlagGridItemLayout}
        initialNumToRender={FLAG_GRID_INITIAL_ITEMS}
        keyboardShouldPersistTaps="handled"
        keyExtractor={getFlagKey}
        maxToRenderPerBatch={FLAG_GRID_MAX_BATCH_ITEMS}
        numColumns={FLAG_GRID_COLUMNS}
        removeClippedSubviews
        renderItem={renderFlagItem}
        updateCellsBatchingPeriod={16}
        windowSize={FLAG_GRID_WINDOW_SIZE}
      />
    </View>
  );
}
