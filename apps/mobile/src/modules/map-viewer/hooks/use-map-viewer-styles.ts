import { useMemo } from "react";

import type {
  Country,
  CountryMapPathResolution,
  OutlyingTerritory,
} from "@geopoto/geo-data";
import { COUNTRIES, OUTLYING_TERRITORIES } from "@geopoto/geo-data";

import type {
  MapViewerPathGroup,
  MapViewerPathLayer,
  MapViewerPathVisualState,
} from "../utils/map-viewer-path-layer";
import {
  getAggregatedMapEntityPath,
  getCountryPressAreaPath,
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
  return useMemo(
    () =>
      buildMapViewerStyleResult({
        activeTargets,
        highlights,
        pathResolution,
      }),
    [activeTargets, highlights, pathResolution],
  );
}

interface MapViewerPathStyle {
  backgroundColor?: string;
  borderColor?: string;
}

type MapEntity = Country | OutlyingTerritory;

interface BuildMapViewerStyleResultParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

interface StyledMapEntity {
  entity: MapEntity;
  style: MapViewerPathStyle;
  visualState: MapViewerPathVisualState;
}

interface StyledCountry {
  entity: Country;
  style: MapViewerPathStyle;
  visualState: MapViewerPathVisualState;
}

interface MapViewerPathGroupState {
  backgroundColor?: string;
  borderColor?: string;
  entities: MapEntity[];
  id: string;
  visualState: MapViewerPathVisualState;
}

const MAP_VIEWER_PATH_VISUAL_STATE_LAYER_ORDER = {
  active: 0,
  highlighted: 1,
} satisfies Record<MapViewerPathVisualState, number>;

function buildMapViewerStyleResult({
  activeTargets,
  highlights,
  pathResolution,
}: BuildMapViewerStyleResultParams): MapViewerPathLayer {
  const styledCountries = buildStyledCountries({
    activeTargets,
    highlights,
  });
  const visibleCountryPressAreaCountryCodeSet =
    getVisibleCountryPressAreaCountryCodeSet({ styledCountries });
  const lowerStyledCountries = styledCountries.filter(
    ({ entity }) => !visibleCountryPressAreaCountryCodeSet.has(entity.code),
  );
  const topStyledCountries = styledCountries.filter(({ entity }) =>
    visibleCountryPressAreaCountryCodeSet.has(entity.code),
  );
  const orderedTopStyledCountries = orderStyledCountriesByVisualPriority({
    styledCountries: topStyledCountries,
  });
  const activeOutlyingTerritoryStyles = buildActiveOutlyingTerritoryStyles({
    activeTargets,
  });
  const highlightedOutlyingTerritoryStyles =
    buildHighlightedOutlyingTerritoryStyles({
      highlights,
    });

  return {
    activePathGroups: buildPathGroupsFromEntityStyles({
      entityStyles: [
        ...lowerStyledCountries.filter(
          ({ visualState }) => visualState === "active",
        ),
        ...activeOutlyingTerritoryStyles,
      ],
      pathResolution,
    }),
    basePath: buildBasePath({
      pathResolution,
      styledCountries,
    }),
    countryPressAreaPathGroups: buildCountryPressAreaPathGroups({
      styledCountries: orderedTopStyledCountries,
    }),
    highlightPathGroups: buildPathGroupsFromEntityStyles({
      entityStyles: [
        ...lowerStyledCountries.filter(
          ({ visualState }) => visualState === "highlighted",
        ),
        ...highlightedOutlyingTerritoryStyles,
      ],
      pathResolution,
    }),
    topCountryPathGroups: buildPathGroupsFromEntityStyles({
      entityStyles: orderedTopStyledCountries,
      pathResolution,
    }),
  };
}

interface BuildStyledCountriesParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  highlights: readonly MapViewerHighlight[];
}

function buildStyledCountries({
  activeTargets,
  highlights,
}: BuildStyledCountriesParams): readonly StyledCountry[] {
  return COUNTRIES.map((country) =>
    getCountryVisualStyle({
      activeTargets,
      country,
      highlights,
    }),
  ).filter(isStyledCountry);
}

interface GetCountryVisualStyleParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  country: Country;
  highlights: readonly MapViewerHighlight[];
}

function getCountryVisualStyle({
  activeTargets,
  country,
  highlights,
}: GetCountryVisualStyleParams): StyledCountry | null {
  const highlightStyle = getMapEntityHighlightStyle({
    entity: country,
    highlights,
  });

  if (highlightStyle !== null) {
    return {
      entity: country,
      style: highlightStyle,
      visualState: "highlighted",
    };
  }

  const isActiveCountry = activeTargets.some((target) =>
    doesMapViewerTargetMatchEntity({
      entity: country,
      target,
    }),
  );

  if (!isActiveCountry) {
    return null;
  }

  return {
    entity: country,
    style: {},
    visualState: "active",
  };
}

interface BuildActiveOutlyingTerritoryStylesParams {
  activeTargets: readonly MapViewerHighlightTarget[];
}

function buildActiveOutlyingTerritoryStyles({
  activeTargets,
}: BuildActiveOutlyingTerritoryStylesParams): readonly StyledMapEntity[] {
  return OUTLYING_TERRITORIES.map((entity) =>
    getActiveMapEntityStyle({
      activeTargets,
      entity,
    }),
  ).filter(isStyledMapEntity);
}

interface BuildHighlightedOutlyingTerritoryStylesParams {
  highlights: readonly MapViewerHighlight[];
}

function buildHighlightedOutlyingTerritoryStyles({
  highlights,
}: BuildHighlightedOutlyingTerritoryStylesParams): readonly StyledMapEntity[] {
  return OUTLYING_TERRITORIES.map((entity) =>
    getHighlightedMapEntityStyle({
      entity,
      highlights,
    }),
  ).filter(isStyledMapEntity);
}

interface BuildBasePathParams {
  pathResolution: CountryMapPathResolution;
  styledCountries: readonly StyledCountry[];
}

function buildBasePath({
  pathResolution,
  styledCountries,
}: BuildBasePathParams): MapViewerPathLayer["basePath"] {
  if (styledCountries.length === 0) {
    return getWorldMapPath({ pathResolution });
  }

  const styledCountryCodeSet = new Set(
    styledCountries.map(({ entity }) => entity.code),
  );

  return getAggregatedMapEntityPath({
    entities: [
      ...COUNTRIES.filter((country) => !styledCountryCodeSet.has(country.code)),
      ...OUTLYING_TERRITORIES,
    ],
    pathResolution,
  });
}

interface GetVisibleCountryPressAreaCountryCodeSetParams {
  styledCountries: readonly StyledCountry[];
}

function getVisibleCountryPressAreaCountryCodeSet({
  styledCountries,
}: GetVisibleCountryPressAreaCountryCodeSetParams): ReadonlySet<string> {
  return new Set(
    styledCountries
      .filter(({ entity }) => entity.countryPressArea !== undefined)
      .map(({ entity }) => entity.code),
  );
}

interface OrderStyledCountriesByVisualPriorityParams {
  styledCountries: readonly StyledCountry[];
}

function orderStyledCountriesByVisualPriority({
  styledCountries,
}: OrderStyledCountriesByVisualPriorityParams): readonly StyledCountry[] {
  return [...styledCountries].sort(
    (leftCountry, rightCountry) =>
      MAP_VIEWER_PATH_VISUAL_STATE_LAYER_ORDER[leftCountry.visualState] -
      MAP_VIEWER_PATH_VISUAL_STATE_LAYER_ORDER[rightCountry.visualState],
  );
}

interface BuildPathGroupsFromEntityStylesParams {
  entityStyles: readonly StyledMapEntity[];
  pathResolution: CountryMapPathResolution;
}

function buildPathGroupsFromEntityStyles({
  entityStyles,
  pathResolution,
}: BuildPathGroupsFromEntityStylesParams): readonly MapViewerPathGroup[] {
  const groups = buildPathGroupStates({ entityStyles });

  return groups
    .map((group) => {
      const path = getAggregatedMapEntityPath({
        entities: group.entities,
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
        visualState: group.visualState,
      };
    })
    .filter(isMapViewerPathGroup);
}

interface BuildCountryPressAreaPathGroupsParams {
  styledCountries: readonly StyledCountry[];
}

function buildCountryPressAreaPathGroups({
  styledCountries,
}: BuildCountryPressAreaPathGroupsParams): readonly MapViewerPathGroup[] {
  return styledCountries
    .map(({ entity, style, visualState }) => {
      const path = getCountryPressAreaPath({ country: entity });

      if (path === null) {
        return null;
      }

      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        id: `${entity.code}:${getPathGroupId({
          style: {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
          },
          visualState,
        })}`,
        path,
        visualState,
      };
    })
    .filter(isMapViewerPathGroup);
}

interface GetActiveMapEntityStyleParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  entity: MapEntity;
}

function getActiveMapEntityStyle({
  activeTargets,
  entity,
}: GetActiveMapEntityStyleParams): StyledMapEntity | null {
  const isActiveEntity = activeTargets.some((target) =>
    doesMapViewerTargetMatchEntity({
      entity,
      target,
    }),
  );

  if (!isActiveEntity) {
    return null;
  }

  return {
    entity,
    style: {},
    visualState: "active",
  };
}

interface GetMapEntityHighlightStyleParams {
  entity: MapEntity;
  highlights: readonly MapViewerHighlight[];
}

function getMapEntityHighlightStyle(
  params: GetMapEntityHighlightStyleParams,
): MapViewerPathStyle | null {
  const { entity, highlights } = params;

  return highlights.reduce<MapViewerPathStyle | null>(
    (matchedStyle, highlight) => {
      const isMatchingHighlight = doesMapViewerTargetMatchEntity({
        entity,
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

function getHighlightedMapEntityStyle(
  params: GetMapEntityHighlightStyleParams,
): StyledMapEntity | null {
  const { entity } = params;
  const style = getMapEntityHighlightStyle(params);

  if (style === null) {
    return null;
  }

  return {
    entity,
    style,
    visualState: "highlighted",
  };
}

function isStyledMapEntity(
  value: StyledMapEntity | null,
): value is StyledMapEntity {
  return value !== null;
}

function isStyledCountry(value: StyledCountry | null): value is StyledCountry {
  return value !== null;
}

interface BuildPathGroupStatesParams {
  entityStyles: readonly StyledMapEntity[];
}

function buildPathGroupStates({
  entityStyles,
}: BuildPathGroupStatesParams): readonly MapViewerPathGroupState[] {
  const groups: MapViewerPathGroupState[] = [];

  for (const entityStyle of entityStyles) {
    const group = groups.find((currentGroup) =>
      doesPathGroupMatchStyle({
        group: currentGroup,
        style: entityStyle.style,
        visualState: entityStyle.visualState,
      }),
    );

    if (group !== undefined) {
      group.entities.push(entityStyle.entity);
      continue;
    }

    groups.push({
      backgroundColor: entityStyle.style.backgroundColor,
      borderColor: entityStyle.style.borderColor,
      entities: [entityStyle.entity],
      id: getPathGroupId({
        style: entityStyle.style,
        visualState: entityStyle.visualState,
      }),
      visualState: entityStyle.visualState,
    });
  }

  return groups;
}

interface DoesPathGroupMatchStyleParams {
  group: MapViewerPathGroupState;
  style: MapViewerPathStyle;
  visualState: MapViewerPathVisualState;
}

function doesPathGroupMatchStyle({
  group,
  style,
  visualState,
}: DoesPathGroupMatchStyleParams): boolean {
  return (
    group.backgroundColor === style.backgroundColor &&
    group.borderColor === style.borderColor &&
    group.visualState === visualState
  );
}

interface GetPathGroupIdParams {
  style: MapViewerPathStyle;
  visualState: MapViewerPathVisualState;
}

function getPathGroupId({ style, visualState }: GetPathGroupIdParams): string {
  return `${visualState}:${style.backgroundColor ?? "default-background"}:${style.borderColor ?? "default-border"}`;
}

function isMapViewerPathGroup(
  value: MapViewerPathGroup | null,
): value is MapViewerPathGroup {
  return value !== null;
}

interface DoesMapViewerTargetMatchEntityParams {
  entity: MapEntity;
  target: MapViewerHighlightTarget;
}

function doesMapViewerTargetMatchEntity({
  entity,
  target,
}: DoesMapViewerTargetMatchEntityParams): boolean {
  switch (target.type) {
    case "country":
      return target.country.code === entity.code;
    case "region":
      return entity.regions.includes(target.region);
    default: {
      const exhaustiveTarget: never = target;

      return exhaustiveTarget;
    }
  }
}
