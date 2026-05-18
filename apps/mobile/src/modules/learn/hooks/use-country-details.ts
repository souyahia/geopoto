import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";

import { COUNTRIES } from "@geopoto/geo-data";
import { getCountryFlag } from "@geopoto/geo-data/flags";

import { type MapViewerHighlightTarget } from "@/modules/map-viewer/utils/map-viewer-viewport";
import { getContinentName } from "@/services/geo-data/continents";
import { getRegionName } from "@/services/geo-data/regions";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import { findCountryByCode } from "../utils/country-search";

interface UseCountryDetailsParams {
  countryCode: string | undefined;
}

const COUNTRY_DETAIL_FLAG_MAX_HEIGHT = 180;
const COUNTRY_DETAIL_FLAG_MAX_WIDTH = 280;
const COUNTRY_DETAIL_FLAG_HORIZONTAL_PADDING = 72;
const DEFAULT_COUNTRY_DETAIL_FLAG_ASPECT_RATIO = 3 / 2;

export function useCountryDetails({ countryCode }: UseCountryDetailsParams) {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const { width: windowWidth } = useWindowDimensions();

  const country = findCountryByCode({
    countries: COUNTRIES,
    countryCode,
  });

  if (!country || !countryCode) {
    return null;
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
  const continentName = getContinentName({ continent: country.continent, t });
  const mapViewerTarget = {
    country,
    type: "country",
  } satisfies MapViewerHighlightTarget;

  return {
    mapViewerTarget,
    countryName,
    countryCode,
    capitalName,
    continentName,
    regionNames,
    flagSize,
  };
}

interface GetCountryDetailFlagSizeParams {
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
}

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
