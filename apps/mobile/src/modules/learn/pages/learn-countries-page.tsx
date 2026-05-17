import {
  LegendList,
  type LegendListRef,
  type LegendListRenderItemProps,
} from "@legendapp/list";
import { useRouter } from "expo-router";
import { SearchField } from "heroui-native/search-field";
import { Text } from "heroui-native/text";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { COUNTRIES, type Country } from "@geopoto/geo-data";

import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import { CountryListItem } from "../components/country-list-item";
import { LearnHeader } from "../components/learn-header";
import { filterCountries } from "../utils/country-search";

const COUNTRY_LIST_ITEM_ESTIMATED_SIZE = 84;

function getCountryKey(country: Country) {
  return country.code;
}

function CountryListSeparator() {
  return <View className="h-2" />;
}

export function LearnCountriesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { geoLang } = useGeoLangStore();
  const listRef = useRef<LegendListRef>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const countries = useMemo(
    () => filterCountries({ countries: COUNTRIES, geoLang, searchQuery }),
    [geoLang, searchQuery],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [searchQuery]);

  const renderCountryItem = useCallback(
    (props: LegendListRenderItemProps<Country>) => {
      const { item } = props;

      return (
        <CountryListItem
          code={item.code}
          name={item.name[geoLang]}
          capital={item.capital[geoLang]}
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
        <SearchField value={searchQuery} onChange={setSearchQuery}>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              accessibilityLabel={t("learn.countries.search.label")}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t("learn.countries.search.placeholder")}
              spellCheck={false}
            />
            <SearchField.ClearButton
              accessibilityLabel={t("learn.countries.search.clear")}
            />
          </SearchField.Group>
        </SearchField>
      </View>
      <LegendList
        ref={listRef}
        data={countries}
        renderItem={renderCountryItem}
        keyExtractor={getCountryKey}
        estimatedItemSize={COUNTRY_LIST_ITEM_ESTIMATED_SIZE}
        recycleItems
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="px-6 pb-8"
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
