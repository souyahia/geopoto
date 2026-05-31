import { Text } from "heroui-native/text";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View, type ListRenderItemInfo } from "react-native";

import type { SupportedGeoLanguage } from "@geopoto/geo-data";
import {
  COUNTRY_SUMMARIES,
  type CountrySummary,
} from "@geopoto/geo-data/country-summaries";

import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import {
  CAPITAL_LIST_ITEM_SEPARATOR_HEIGHT,
  CAPITAL_LIST_ITEM_TOTAL_HEIGHT,
  CapitalListItem,
} from "../components/capital-list-item";
import { LearnHeader } from "../components/learn-header";
import { LearnSearchField } from "../components/learn-search-field";
import {
  filterCapitals,
  type CapitalSearchItem,
} from "../utils/capital-search";

interface CapitalListData extends CapitalSearchItem {
  code: string;
}

interface CompareCapitalListItemsParams {
  collator: Intl.Collator;
  left: CapitalListData;
  right: CapitalListData;
}

interface GetCapitalListDataParams {
  countries: readonly CountrySummary[];
  geoLang: SupportedGeoLanguage;
}

interface ToCapitalListDataParams {
  country: CountrySummary;
  geoLang: SupportedGeoLanguage;
}

const CAPITAL_LIST_INITIAL_ITEMS = 12;
const CAPITAL_LIST_WINDOW_SIZE = 7;
const CAPITAL_LIST_CONTENT_CONTAINER_STYLE = {
  paddingBottom: 32,
  paddingHorizontal: 24,
};
const CAPITAL_LIST_SEPARATOR_STYLE = {
  height: CAPITAL_LIST_ITEM_SEPARATOR_HEIGHT,
};

function getCapitalKey(capital: CapitalListData) {
  return capital.code;
}

function getCapitalListItemLayout(
  _data: ArrayLike<CapitalListData> | null | undefined,
  index: number,
) {
  return {
    index,
    length: CAPITAL_LIST_ITEM_TOTAL_HEIGHT,
    offset: CAPITAL_LIST_ITEM_TOTAL_HEIGHT * index,
  };
}

function CapitalListSeparator() {
  return <View style={CAPITAL_LIST_SEPARATOR_STYLE} />;
}

function compareCapitalListItems({
  collator,
  left,
  right,
}: CompareCapitalListItemsParams) {
  const capitalComparison = collator.compare(
    left.capitalName,
    right.capitalName,
  );

  if (capitalComparison !== 0) {
    return capitalComparison;
  }

  return collator.compare(left.countryName, right.countryName);
}

function getCapitalListData({
  countries,
  geoLang,
}: GetCapitalListDataParams): readonly CapitalListData[] {
  const collator = new Intl.Collator(geoLang);

  return countries
    .map((country) => toCapitalListData({ country, geoLang }))
    .sort((left, right) => compareCapitalListItems({ collator, left, right }));
}

function toCapitalListData({
  country,
  geoLang,
}: ToCapitalListDataParams): CapitalListData {
  return {
    capitalName: country.capital[geoLang],
    code: country.code,
    countryName: country.name[geoLang],
  };
}

export function LearnCapitalsPage() {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const listRef = useRef<FlatList<CapitalListData>>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCapitals = useMemo(
    () => getCapitalListData({ countries: COUNTRY_SUMMARIES, geoLang }),
    [geoLang],
  );

  const capitals = useMemo(
    () => filterCapitals({ capitals: sortedCapitals, searchQuery }),
    [searchQuery, sortedCapitals],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [searchQuery]);

  const renderCapitalItem = useCallback(
    (props: ListRenderItemInfo<CapitalListData>) => {
      const { item } = props;

      return (
        <CapitalListItem
          capitalName={item.capitalName}
          code={item.code}
          countryName={item.countryName}
        />
      );
    },
    [],
  );

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={t("learn.capitals.title")} />
      <View className="px-6 pb-3 pt-4">
        <LearnSearchField
          accessibilityLabel={t("learn.capitals.search.label")}
          clearAccessibilityLabel={t("learn.capitals.search.clear")}
          onChange={setSearchQuery}
          placeholder={t("learn.capitals.search.placeholder")}
          value={searchQuery}
        />
      </View>
      <FlatList
        ref={listRef}
        data={capitals}
        renderItem={renderCapitalItem}
        keyExtractor={getCapitalKey}
        getItemLayout={getCapitalListItemLayout}
        initialNumToRender={CAPITAL_LIST_INITIAL_ITEMS}
        maxToRenderPerBatch={CAPITAL_LIST_INITIAL_ITEMS}
        windowSize={CAPITAL_LIST_WINDOW_SIZE}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={CAPITAL_LIST_CONTENT_CONTAINER_STYLE}
        ItemSeparatorComponent={CapitalListSeparator}
        ListEmptyComponent={
          <View className="items-center px-6 py-12">
            <Text type="body" color="muted" align="center">
              {t("learn.capitals.empty")}
            </Text>
          </View>
        }
      />
    </View>
  );
}
