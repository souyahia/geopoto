import { useMemo } from "react";

import type { Country, CountryMapPathResolution } from "@geopoto/geo-data";
import { COUNTRIES } from "@geopoto/geo-data";

import type { MapViewerPathGroup } from "../utils/map-viewer-path-layer";
import {
  getAggregatedCountryMapPath,
  getWorldMapPath,
} from "../utils/map-viewer-skia-paths";
import type { MapViewerHighlightTarget } from "../utils/map-viewer-viewport";
import { useMapViewerColors } from "./use-map-viewer-colors";

export interface MapViewerHighlight {
  target: MapViewerHighlightTarget;
  backgroundColor?: string;
  borderColor?: string;
}

interface UseMapViewerStylesParams {
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

export function useMapViewerStyles({
  highlights,
  pathResolution,
}: UseMapViewerStylesParams) {
  const mapViewerColors = useMapViewerColors();
  const basePath = useMemo(
    () => getWorldMapPath({ pathResolution }),
    [pathResolution],
  );

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

  const highlightPathGroups = useMemo(
    () =>
      buildHighlightPathGroups({
        defaultHighlightStyle,
        highlights,
        pathResolution,
      }),
    [defaultHighlightStyle, highlights, pathResolution],
  );

  return {
    basePath,
    countryBackgroundColor: mapViewerColors.countryBackgroundColor,
    countryBorderColor: mapViewerColors.countryBorderColor,
    highlightPathGroups,
  };
}

interface MapViewerHighlightStyle {
  backgroundColor: string;
  borderColor: string;
}

interface BuildHighlightPathGroupsParams {
  defaultHighlightStyle: MapViewerHighlightStyle;
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

interface HighlightedCountryStyle {
  country: Country;
  style: MapViewerHighlightStyle;
}

interface HighlightPathGroupState {
  backgroundColor: string;
  borderColor: string;
  countries: Country[];
  id: string;
}

function buildHighlightPathGroups(
  params: BuildHighlightPathGroupsParams,
): readonly MapViewerPathGroup[] {
  const { defaultHighlightStyle, highlights, pathResolution } = params;

  if (highlights.length === 0) {
    return [];
  }

  const highlightedCountryStyles = COUNTRIES.map((country) =>
    getHighlightedCountryStyle({
      country,
      defaultStyle: defaultHighlightStyle,
      highlights,
    }),
  ).filter(isHighlightedCountryStyle);
  const groups = buildHighlightPathGroupStates({ highlightedCountryStyles });

  return groups
    .map((group) => {
      const path = getAggregatedCountryMapPath({
        countries: group.countries,
        pathResolution,
      });

      if (path === null) {
        return null;
      }

      return {
        backgroundColor: group.backgroundColor,
        borderColor: group.borderColor,
        id: group.id,
        path,
      };
    })
    .filter(isMapViewerPathGroup);
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

function getHighlightedCountryStyle(
  params: GetCountryHighlightStyleParams,
): HighlightedCountryStyle | null {
  const { country } = params;
  const style = getCountryHighlightStyle(params);

  if (style === null) {
    return null;
  }

  return {
    country,
    style,
  };
}

function isHighlightedCountryStyle(
  value: HighlightedCountryStyle | null,
): value is HighlightedCountryStyle {
  return value !== null;
}

interface BuildHighlightPathGroupStatesParams {
  highlightedCountryStyles: readonly HighlightedCountryStyle[];
}

function buildHighlightPathGroupStates({
  highlightedCountryStyles,
}: BuildHighlightPathGroupStatesParams): readonly HighlightPathGroupState[] {
  const groups: HighlightPathGroupState[] = [];

  for (const highlightedCountryStyle of highlightedCountryStyles) {
    const group = groups.find((currentGroup) =>
      doesHighlightPathGroupMatchStyle({
        group: currentGroup,
        style: highlightedCountryStyle.style,
      }),
    );

    if (group !== undefined) {
      group.countries.push(highlightedCountryStyle.country);
      continue;
    }

    groups.push({
      backgroundColor: highlightedCountryStyle.style.backgroundColor,
      borderColor: highlightedCountryStyle.style.borderColor,
      countries: [highlightedCountryStyle.country],
      id: getHighlightPathGroupId({
        style: highlightedCountryStyle.style,
      }),
    });
  }

  return groups;
}

interface DoesHighlightPathGroupMatchStyleParams {
  group: HighlightPathGroupState;
  style: MapViewerHighlightStyle;
}

function doesHighlightPathGroupMatchStyle({
  group,
  style,
}: DoesHighlightPathGroupMatchStyleParams): boolean {
  return (
    group.backgroundColor === style.backgroundColor &&
    group.borderColor === style.borderColor
  );
}

interface GetHighlightPathGroupIdParams {
  style: MapViewerHighlightStyle;
}

function getHighlightPathGroupId({
  style,
}: GetHighlightPathGroupIdParams): string {
  return `${style.backgroundColor}:${style.borderColor}`;
}

function isMapViewerPathGroup(
  value: MapViewerPathGroup | null,
): value is MapViewerPathGroup {
  return value !== null;
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
