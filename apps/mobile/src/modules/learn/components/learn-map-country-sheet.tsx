import { BottomSheet } from "heroui-native/bottom-sheet";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import type {
  Country,
  MapRegionName,
  SupportedGeoLanguage,
} from "@geopoto/geo-data";

import { FlagIcon } from "@/components/flag-icon";
import { PAGE_MODAL_SURFACE_STYLE } from "@/components/page-content";
import { getContinentName } from "@/services/geo-data/continents";
import { getRegionName } from "@/services/geo-data/regions";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import { CountryInfoRow } from "./country-info-section";

interface LearnMapCountrySheetProps {
  country: Country | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface LearnMapCountryInfo {
  capitalName: string;
  countryCode: string;
  countryName: string;
  regionLabel: string;
}

interface GetLearnMapCountryInfoParams {
  country: Country;
  geoLang: SupportedGeoLanguage;
  t: TFunction;
}

const LEARN_MAP_COUNTRY_SHEET_SNAP_POINTS = ["34%"];
const LEARN_MAP_COUNTRY_FLAG_ICON_WIDTH = 56;

export function LearnMapCountrySheet({
  country,
  isOpen,
  onOpenChange,
}: LearnMapCountrySheetProps) {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const countryInfo = useMemo(() => {
    if (country === null) {
      return null;
    }

    return getLearnMapCountryInfo({ country, geoLang, t });
  }, [country, geoLang, t]);

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          contentContainerClassName="gap-5 px-6 pb-safe-offset-6 pt-2"
          snapPoints={LEARN_MAP_COUNTRY_SHEET_SNAP_POINTS}
          style={PAGE_MODAL_SURFACE_STYLE}
        >
          {countryInfo === null ? null : (
            <>
              <View className="flex-row items-center gap-4">
                <FlagIcon
                  code={countryInfo.countryCode}
                  width={LEARN_MAP_COUNTRY_FLAG_ICON_WIDTH}
                />
                <View className="min-w-0 flex-1 justify-center">
                  <BottomSheet.Title className="text-xl font-semibold leading-7">
                    {countryInfo.countryName}
                  </BottomSheet.Title>
                </View>
                <BottomSheet.Close
                  accessibilityLabel={t("learn.map.country-sheet.close")}
                />
              </View>
              <View className="gap-3">
                <CountryInfoRow
                  label={t("learn.country.fields.capital")}
                  value={countryInfo.capitalName}
                />
                <CountryInfoRow
                  label={t("learn.map.country-sheet.fields.region")}
                  value={countryInfo.regionLabel}
                />
              </View>
            </>
          )}
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function getLearnMapCountryInfo({
  country,
  geoLang,
  t,
}: GetLearnMapCountryInfoParams): LearnMapCountryInfo {
  return {
    capitalName: country.capital[geoLang],
    countryCode: country.code,
    countryName: country.name[geoLang],
    regionLabel: getLearnMapCountryRegionLabel({ country, t }),
  };
}

interface GetLearnMapCountryRegionLabelParams {
  country: Country;
  t: TFunction;
}

function getLearnMapCountryRegionLabel({
  country,
  t,
}: GetLearnMapCountryRegionLabelParams): string {
  const continentName = getContinentName({ continent: country.continent, t });
  const secondaryRegionNames = country.regions
    .filter((region) => isSecondaryCountryRegion({ country, region }))
    .map((region) => getRegionName({ region, t }));

  if (secondaryRegionNames.length === 0) {
    return continentName;
  }

  return `${continentName} / ${secondaryRegionNames.join(", ")}`;
}

interface IsSecondaryCountryRegionParams {
  country: Country;
  region: MapRegionName;
}

function isSecondaryCountryRegion({
  country,
  region,
}: IsSecondaryCountryRegionParams): boolean {
  if (region === "world") {
    return false;
  }

  return region !== country.continent;
}
