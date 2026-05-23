import { useMemo } from "react";

import type {
  Country,
  CountryMapPathResolution,
  OutlyingTerritory,
} from "@geopoto/geo-data";
import { COUNTRIES, OUTLYING_TERRITORIES } from "@geopoto/geo-data";

import type { MapViewerPathGroup } from "../utils/map-viewer-path-layer";
import {
  getAggregatedMapEntityPath,
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

type MapEntity = Country | OutlyingTerritory;

const MAP_ENTITIES: readonly MapEntity[] = [
  ...COUNTRIES,
  ...OUTLYING_TERRITORIES,
];

interface BuildActivePathGroupsParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  pathResolution: CountryMapPathResolution;
}

interface BuildHighlightPathGroupsParams {
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

interface StyledMapEntity {
  entity: MapEntity;
  style: MapViewerPathStyle;
}

interface MapViewerPathGroupState {
  backgroundColor?: string;
  borderColor?: string;
  entities: MapEntity[];
  id: string;
}

function buildActivePathGroups(
  params: BuildActivePathGroupsParams,
): readonly MapViewerPathGroup[] {
  const { activeTargets, pathResolution } = params;

  if (activeTargets.length === 0) {
    return [];
  }

  const entityStyles = MAP_ENTITIES.map((entity) =>
    getActiveMapEntityStyle({
      activeTargets,
      entity,
    }),
  ).filter(isStyledMapEntity);

  return buildPathGroupsFromEntityStyles({
    entityStyles,
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

  const entityStyles = MAP_ENTITIES.map((entity) =>
    getHighlightedMapEntityStyle({
      entity,
      highlights,
    }),
  ).filter(isStyledMapEntity);

  return buildPathGroupsFromEntityStyles({
    entityStyles,
    pathResolution,
  });
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
  };
}

function isStyledMapEntity(
  value: StyledMapEntity | null,
): value is StyledMapEntity {
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

interface DoesMapViewerTargetMatchEntityParams {
  entity: MapEntity;
  target: MapViewerHighlightTarget;
}

function doesMapViewerTargetMatchEntity(
  params: DoesMapViewerTargetMatchEntityParams,
): boolean {
  const { entity, target } = params;

  switch (target.type) {
    case "country":
      return target.country.code === entity.code;
    case "region":
      return entity.regions.includes(target.region);
    default:
      return false;
  }
}
