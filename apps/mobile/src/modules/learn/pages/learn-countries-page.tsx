import { useRouter } from "expo-router";
import { Text } from "heroui-native/text";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View, type ListRenderItemInfo } from "react-native";

import {
  COUNTRY_SUMMARIES_BY_NAME,
  type CountrySummary,
} from "@geopoto/geo-data/country-summaries";

import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import {
  COUNTRY_LIST_ITEM_SEPARATOR_HEIGHT,
  COUNTRY_LIST_ITEM_TOTAL_HEIGHT,
  CountryListItem,
} from "../components/country-list-item";
import { LearnHeader } from "../components/learn-header";
import { LearnSearchField } from "../components/learn-search-field";
import { filterCountries } from "../utils/country-search";

const COUNTRY_LIST_INITIAL_ITEMS = 12;
const COUNTRY_LIST_WINDOW_SIZE = 7;
const COUNTRY_LIST_CONTENT_CONTAINER_STYLE = {
  paddingBottom: 32,
  paddingHorizontal: 24,
};
const COUNTRY_LIST_SEPARATOR_STYLE = {
  height: COUNTRY_LIST_ITEM_SEPARATOR_HEIGHT,
};

function getCountryKey(country: CountrySummary) {
  return country.code;
}

function getCountryListItemLayout(
  _data: ArrayLike<CountrySummary> | null | undefined,
  index: number,
) {
  return {
    index,
    length: COUNTRY_LIST_ITEM_TOTAL_HEIGHT,
    offset: COUNTRY_LIST_ITEM_TOTAL_HEIGHT * index,
  };
}

function CountryListSeparator() {
  return <View style={COUNTRY_LIST_SEPARATOR_STYLE} />;
}

export function LearnCountriesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { geoLang } = useGeoLangStore();
  const listRef = useRef<FlatList<CountrySummary>>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sortedCountries = COUNTRY_SUMMARIES_BY_NAME[geoLang];

  const countries = useMemo(
    () => filterCountries({ countries: sortedCountries, geoLang, searchQuery }),
    [geoLang, searchQuery, sortedCountries],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [searchQuery]);

  const renderCountryItem = useCallback(
    (props: ListRenderItemInfo<CountrySummary>) => {
      const { item } = props;

      return (
        <CountryListItem
          code={item.code}
          name={item.name[geoLang]}
          onPress={() => router.push(`/learn/countries/${item.code}`)}
        />
      );
    },
    [geoLang, router],
  );

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={t("learn.countries.title")} />
      <View className="px-6 pb-3 pt-4">
        <LearnSearchField
          accessibilityLabel={t("learn.countries.search.label")}
          clearAccessibilityLabel={t("learn.countries.search.clear")}
          onChange={setSearchQuery}
          placeholder={t("learn.countries.search.placeholder")}
          value={searchQuery}
        />
      </View>
      <FlatList
        ref={listRef}
        data={countries}
        renderItem={renderCountryItem}
        keyExtractor={getCountryKey}
        getItemLayout={getCountryListItemLayout}
        initialNumToRender={COUNTRY_LIST_INITIAL_ITEMS}
        maxToRenderPerBatch={COUNTRY_LIST_INITIAL_ITEMS}
        windowSize={COUNTRY_LIST_WINDOW_SIZE}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={COUNTRY_LIST_CONTENT_CONTAINER_STYLE}
        ItemSeparatorComponent={CountryListSeparator}
        ListEmptyComponent={
          <View className="items-center px-6 py-12">
            <Text type="body" color="muted" align="center">
              {t("learn.countries.empty")}
            </Text>
          </View>
        }
      />
    </View>
  );
}
