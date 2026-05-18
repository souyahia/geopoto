import { useMemo } from "react";

import type { Country } from "@geopoto/geo-data";
import { COUNTRIES } from "@geopoto/geo-data";

import type {
  LayoutSize,
  MapViewerHighlightTarget,
  MapViewport,
} from "../utils/map-viewer-viewport";
import { getStrokeWidth } from "../utils/map-viewer-viewport";
import { useMapViewerColors } from "./use-map-viewer-colors";

export interface MapViewerHighlight {
  target: MapViewerHighlightTarget;
  backgroundColor?: string;
  borderColor?: string;
}

interface UseMapViewerStylesParams {
  layoutSize: LayoutSize;
  viewport: MapViewport;
  highlights: readonly MapViewerHighlight[];
}

export function useMapViewerStyles({
  highlights,
  layoutSize,
  viewport,
}: UseMapViewerStylesParams) {
  const mapViewerColors = useMapViewerColors();
  const strokeWidth = getStrokeWidth({ layoutSize, viewport });

  const defaultHighlightStyle = useMemo(
    () => ({
      backgroundColor: mapViewerColors.highlightBackgroundColor,
      borderColor: mapViewerColors.highlightBorderColor,
    }),
    [
      mapViewerColors.highlightBackgroundColor,
      mapViewerColors.highlightBorderColor,
    ],
  );

  const countryStyles = useMemo(
    () =>
      buildCountryMapStyles({
        countryBackgroundColor: mapViewerColors.countryBackgroundColor,
        countryBorderColor: mapViewerColors.countryBorderColor,
        defaultHighlightStyle,
        highlights,
        strokeWidth,
      }),
    [
      defaultHighlightStyle,
      highlights,
      mapViewerColors.countryBackgroundColor,
      mapViewerColors.countryBorderColor,
      strokeWidth,
    ],
  );

  return {
    countryStyles,
  };
}

interface MapViewerHighlightStyle {
  backgroundColor: string;
  borderColor: string;
}

interface BuildCountryMapStylesParams {
  countryBackgroundColor: string;
  countryBorderColor: string;
  defaultHighlightStyle: MapViewerHighlightStyle;
  highlights: readonly MapViewerHighlight[];
  strokeWidth: number;
}

interface CountryMapStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  country: Country;
}

function buildCountryMapStyles(
  params: BuildCountryMapStylesParams,
): readonly CountryMapStyle[] {
  const {
    countryBackgroundColor,
    countryBorderColor,
    defaultHighlightStyle,
    highlights,
    strokeWidth,
  } = params;

  return COUNTRIES.map((country) => {
    const highlightStyle = getCountryHighlightStyle({
      country,
      defaultStyle: defaultHighlightStyle,
      highlights,
    });

    return {
      backgroundColor:
        highlightStyle?.backgroundColor ?? countryBackgroundColor,
      borderColor: highlightStyle?.borderColor ?? countryBorderColor,
      borderWidth: highlightStyle === null ? strokeWidth : strokeWidth * 2,
      country,
    };
  });
}

interface GetCountryHighlightStyleParams {
  country: Country;
  defaultStyle: MapViewerHighlightStyle;
  highlights: readonly MapViewerHighlight[];
}

function getCountryHighlightStyle(
  params: GetCountryHighlightStyleParams,
): MapViewerHighlightStyle | null {
  const { country, defaultStyle, highlights } = params;

  return highlights.reduce<MapViewerHighlightStyle | null>(
    (matchedStyle, highlight) => {
      const isMatchingHighlight = doesHighlightTargetCountry({
        country,
        target: highlight.target,
      });

      if (!isMatchingHighlight) {
        return matchedStyle;
      }

      return {
        backgroundColor:
          highlight.backgroundColor ?? defaultStyle.backgroundColor,
        borderColor: highlight.borderColor ?? defaultStyle.borderColor,
      };
    },
    null,
  );
}

interface DoesHighlightTargetCountryParams {
  country: Country;
  target: MapViewerHighlightTarget;
}

function doesHighlightTargetCountry(
  params: DoesHighlightTargetCountryParams,
): boolean {
  const { country, target } = params;

  switch (target.type) {
    case "country":
      return target.country.code === country.code;
    case "region":
      return country.regions.includes(target.region);
    default:
      return false;
  }
}
