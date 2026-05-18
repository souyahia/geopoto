import { useLocalSearchParams } from "expo-router";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { CountryFlag } from "@/components/country-flag";
import { MapViewer } from "@/modules/map-viewer/components/map-viewer";

import { CountryInfoRow } from "../components/country-info-section";
import { LearnHeader } from "../components/learn-header";
import { useCountryDetails } from "../hooks/use-country-details";
import { useDisableCountryScroll } from "../hooks/use-disable-country-scroll";

const PALESTINE_COUNTRY_CODE = "PS";

export function LearnCountryPage() {
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const countryCodeParam = getCountryCodeParam(params.countryCode);
  const countryDetails = useCountryDetails({ countryCode: countryCodeParam });

  const { isMapViewerGestureActive, mapViewerInteractionHandlers } =
    useDisableCountryScroll();

  if (countryDetails === null) {
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

  const {
    mapViewerTarget,
    countryName,
    countryCode,
    capitalName,
    continentName,
    regionNames,
    flagSize,
  } = countryDetails;
  const isPalestine = countryCode === PALESTINE_COUNTRY_CODE;

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={countryName} />
      <ScrollView className="flex-1" scrollEnabled={!isMapViewerGestureActive}>
        <View className="gap-4 px-6 pb-8 pt-4">
          <View className="items-center justify-center px-4 py-6">
            <CountryFlag
              code={countryCode}
              height={flagSize.height}
              width={flagSize.width}
            />
            {isPalestine && <FreePalestineBadge />}
          </View>
          <MapViewer
            centersOn={mapViewerTarget}
            highlights={[{ target: mapViewerTarget }]}
            isInteractive
            {...mapViewerInteractionHandlers}
          />
          <Surface variant="secondary" className="gap-4">
            <CountryInfoRow
              label={t("learn.country.fields.name")}
              value={countryName}
            />
            <CountryInfoRow
              label={t("learn.country.fields.code")}
              value={countryCode}
            />
            <CountryInfoRow
              label={t("learn.country.fields.capital")}
              value={capitalName}
            />
            <CountryInfoRow
              label={t("learn.country.fields.continent")}
              value={continentName}
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

function FreePalestineBadge() {
  return (
    <Text
      type="body-sm"
      className="font-bold text-accent-foreground mt-4 flex-row items-center gap-2 rounded-full bg-accent px-4 py-2"
    >
      ❤️ FREE PALESTINE ❤️
    </Text>
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
