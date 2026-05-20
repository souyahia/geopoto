import { useMemo } from "react";

import type { Country, CountryMapPathResolution } from "@geopoto/geo-data";
import { COUNTRIES } from "@geopoto/geo-data";

import type { MapViewerPathGroup } from "../utils/map-viewer-path-layer";
import {
  getAggregatedCountryMapPath,
  getWorldMapPath,
} from "../utils/map-viewer-skia-paths";
import type { MapViewerHighlightTarget } from "../utils/map-viewer-viewport";

export interface MapViewerHighlight {
  target: MapViewerHighlightTarget;
  backgroundColor?: string;
  borderColor?: string;
}

interface UseMapViewerStylesParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

export function useMapViewerStyles({
  activeTargets,
  highlights,
  pathResolution,
}: UseMapViewerStylesParams) {
  const basePath = useMemo(
    () => getWorldMapPath({ pathResolution }),
    [pathResolution],
  );

  const activePathGroups = useMemo(
    () =>
      buildActivePathGroups({
        activeTargets,
        pathResolution,
      }),
    [activeTargets, pathResolution],
  );
  const highlightPathGroups = useMemo(
    () =>
      buildHighlightPathGroups({
        highlights,
        pathResolution,
      }),
    [highlights, pathResolution],
  );

  return {
    activePathGroups,
    basePath,
    highlightPathGroups,
  };
}

interface MapViewerPathStyle {
  backgroundColor?: string;
  borderColor?: string;
}

interface BuildActivePathGroupsParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  pathResolution: CountryMapPathResolution;
}

interface BuildHighlightPathGroupsParams {
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

interface StyledCountry {
  country: Country;
  style: MapViewerPathStyle;
}

interface MapViewerPathGroupState {
  backgroundColor?: string;
  borderColor?: string;
  countries: Country[];
  id: string;
}

function buildActivePathGroups(
  params: BuildActivePathGroupsParams,
): readonly MapViewerPathGroup[] {
  const { activeTargets, pathResolution } = params;

  if (activeTargets.length === 0) {
    return [];
  }

  const countryStyles = COUNTRIES.map((country) =>
    getActiveCountryStyle({
      activeTargets,
      country,
    }),
  ).filter(isStyledCountry);

  return buildPathGroupsFromCountryStyles({
    countryStyles,
    pathResolution,
  });
}

function buildHighlightPathGroups(
  params: BuildHighlightPathGroupsParams,
): readonly MapViewerPathGroup[] {
  const { highlights, pathResolution } = params;

  if (highlights.length === 0) {
    return [];
  }

  const countryStyles = COUNTRIES.map((country) =>
    getHighlightedCountryStyle({
      country,
      highlights,
    }),
  ).filter(isStyledCountry);

  return buildPathGroupsFromCountryStyles({
    countryStyles,
    pathResolution,
  });
}

interface BuildPathGroupsFromCountryStylesParams {
  countryStyles: readonly StyledCountry[];
  pathResolution: CountryMapPathResolution;
}

function buildPathGroupsFromCountryStyles({
  countryStyles,
  pathResolution,
}: BuildPathGroupsFromCountryStylesParams): readonly MapViewerPathGroup[] {
  const groups = buildPathGroupStates({ countryStyles });

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

interface GetActiveCountryStyleParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  country: Country;
}

function getActiveCountryStyle({
  activeTargets,
  country,
}: GetActiveCountryStyleParams): StyledCountry | null {
  const isActiveCountry = activeTargets.some((target) =>
    doesMapViewerTargetMatchCountry({
      country,
      target,
    }),
  );

  if (!isActiveCountry) {
    return null;
  }

  return {
    country,
    style: {},
  };
}

interface GetCountryHighlightStyleParams {
  country: Country;
  highlights: readonly MapViewerHighlight[];
}

function getCountryHighlightStyle(
  params: GetCountryHighlightStyleParams,
): MapViewerPathStyle | null {
  const { country, highlights } = params;

  return highlights.reduce<MapViewerPathStyle | null>(
    (matchedStyle, highlight) => {
      const isMatchingHighlight = doesMapViewerTargetMatchCountry({
        country,
        target: highlight.target,
      });

      if (!isMatchingHighlight) {
        return matchedStyle;
      }

      return {
        backgroundColor: highlight.backgroundColor,
        borderColor: highlight.borderColor,
      };
    },
    null,
  );
}

function getHighlightedCountryStyle(
  params: GetCountryHighlightStyleParams,
): StyledCountry | null {
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

function isStyledCountry(value: StyledCountry | null): value is StyledCountry {
  return value !== null;
}

interface BuildPathGroupStatesParams {
  countryStyles: readonly StyledCountry[];
}

function buildPathGroupStates({
  countryStyles,
}: BuildPathGroupStatesParams): readonly MapViewerPathGroupState[] {
  const groups: MapViewerPathGroupState[] = [];

  for (const countryStyle of countryStyles) {
    const group = groups.find((currentGroup) =>
      doesPathGroupMatchStyle({
        group: currentGroup,
        style: countryStyle.style,
      }),
    );

    if (group !== undefined) {
      group.countries.push(countryStyle.country);
      continue;
    }

    groups.push({
      backgroundColor: countryStyle.style.backgroundColor,
      borderColor: countryStyle.style.borderColor,
      countries: [countryStyle.country],
      id: getPathGroupId({
        style: countryStyle.style,
      }),
    });
  }

  return groups;
}

interface DoesPathGroupMatchStyleParams {
  group: MapViewerPathGroupState;
  style: MapViewerPathStyle;
}

function doesPathGroupMatchStyle({
  group,
  style,
}: DoesPathGroupMatchStyleParams): boolean {
  return (
    group.backgroundColor === style.backgroundColor &&
    group.borderColor === style.borderColor
  );
}

interface GetPathGroupIdParams {
  style: MapViewerPathStyle;
}

function getPathGroupId({ style }: GetPathGroupIdParams): string {
  return `${style.backgroundColor ?? "default-background"}:${style.borderColor ?? "default-border"}`;
}

function isMapViewerPathGroup(
  value: MapViewerPathGroup | null,
): value is MapViewerPathGroup {
  return value !== null;
}

interface DoesMapViewerTargetMatchCountryParams {
  country: Country;
  target: MapViewerHighlightTarget;
}

function doesMapViewerTargetMatchCountry(
  params: DoesMapViewerTargetMatchCountryParams,
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
