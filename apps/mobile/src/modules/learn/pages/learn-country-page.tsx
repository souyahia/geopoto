import { useLocalSearchParams } from "expo-router";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";

import { COUNTRIES } from "@geopoto/geo-data";
import { getCountryFlag } from "@geopoto/geo-data/flags";

import { CountryFlag } from "@/components/country-flag";
import { getContinentName } from "@/services/geo-data/continents";
import { getRegionName } from "@/services/geo-data/regions";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import { CountryInfoRow } from "../components/country-info-section";
import { LearnHeader } from "../components/learn-header";
import { findCountryByCode } from "../utils/country-search";

interface GetCountryDetailFlagSizeParams {
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
}

const COUNTRY_DETAIL_FLAG_MAX_HEIGHT = 180;
const COUNTRY_DETAIL_FLAG_MAX_WIDTH = 280;
const COUNTRY_DETAIL_FLAG_HORIZONTAL_PADDING = 72;
const DEFAULT_COUNTRY_DETAIL_FLAG_ASPECT_RATIO = 3 / 2;

function getCountryDetailFlagSize({
  aspectRatio,
  maxHeight,
  maxWidth,
}: GetCountryDetailFlagSizeParams) {
  const heightFromMaxWidth = maxWidth / aspectRatio;

  if (heightFromMaxWidth <= maxHeight) {
    return {
      height: heightFromMaxWidth,
      width: maxWidth,
    };
  }

  return {
    height: maxHeight,
    width: maxHeight * aspectRatio,
  };
}

export function LearnCountryPage() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const { geoLang } = useGeoLangStore();
  const params = useLocalSearchParams();
  const countryCodeParam = getCountryCodeParam(params.countryCode);
  const country = findCountryByCode({
    countries: COUNTRIES,
    countryCode: countryCodeParam,
  });

  if (country === null) {
    return (
      <View className="flex-1 p-safe">
        <LearnHeader title={t("learn.country.not-found.title")} />
        <View className="flex-1 items-center justify-center px-8">
          <Text type="body" color="muted" align="center">
            {t("learn.country.not-found.description")}
          </Text>
        </View>
      </View>
    );
  }

  const countryName = country.name[geoLang];
  const capitalName = country.capital[geoLang];
  const flag = getCountryFlag(country.code);
  const flagMaxWidth = Math.min(
    COUNTRY_DETAIL_FLAG_MAX_WIDTH,
    windowWidth - COUNTRY_DETAIL_FLAG_HORIZONTAL_PADDING,
  );
  const flagSize = getCountryDetailFlagSize({
    aspectRatio: flag?.aspectRatio ?? DEFAULT_COUNTRY_DETAIL_FLAG_ASPECT_RATIO,
    maxHeight: COUNTRY_DETAIL_FLAG_MAX_HEIGHT,
    maxWidth: flagMaxWidth,
  });
  const regionNames = country.regions
    .map((region) => getRegionName({ region, t }))
    .join(", ");

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={countryName} />
      <ScrollView className="flex-1">
        <View className="gap-4 px-6 pb-8 pt-4">
          <View className="items-center justify-center px-4 py-6">
            <CountryFlag
              code={country.code}
              height={flagSize.height}
              width={flagSize.width}
            />
          </View>

          <Surface variant="secondary" className="gap-4">
            <CountryInfoRow
              label={t("learn.country.fields.name")}
              value={countryName}
            />
            <CountryInfoRow
              label={t("learn.country.fields.code")}
              value={country.code}
            />
            <CountryInfoRow
              label={t("learn.country.fields.capital")}
              value={capitalName}
            />
            <CountryInfoRow
              label={t("learn.country.fields.continent")}
              value={getContinentName({ continent: country.continent, t })}
            />
            <CountryInfoRow
              label={t("learn.country.fields.regions")}
              value={regionNames}
            />
          </Surface>
        </View>
      </ScrollView>
    </View>
  );
}

function getCountryCodeParam(
  countryCode: string | readonly string[] | undefined,
) {
  if (Array.isArray(countryCode)) {
    return countryCode[0];
  }

  return countryCode;
}
