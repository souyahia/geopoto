import type { SkPath } from "@shopify/react-native-skia";

import type {
  Country,
  CountryMapPathResolution,
  MapBounds,
} from "@geopoto/geo-data";
import { COUNTRIES, isCountryDisabled } from "@geopoto/geo-data";

import type { MapViewerPathVisualState } from "./map-viewer-path-layer";
import {
  getCountryMapPath,
  getCountryPressAreaPath,
} from "./map-viewer-skia-paths";
import {
  doesMapViewerTargetMatchEntity,
  type MapViewerHighlight,
  type MapPoint,
  type MapViewerHighlightTarget,
} from "./map-viewer-viewport";

export interface MapViewerCountryPressTarget {
  bounds: MapBounds;
  country: Country;
  path: SkPath;
  visualState: MapViewerPathVisualState;
}

interface BuildMapViewerCountryPressTargetsParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

interface GetMapViewerCountryPressTargetParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  country: Country;
  highlights: readonly MapViewerHighlight[];
  pathResolution: CountryMapPathResolution;
}

interface GetMapViewerCountryPressVisualStateParams {
  activeTargets: readonly MapViewerHighlightTarget[];
  country: Country;
  highlights: readonly MapViewerHighlight[];
}

interface GetCountryPressPathParams {
  country: Country;
  pathResolution: CountryMapPathResolution;
}

interface GetCountryPressAreaPriorityParams {
  target: MapViewerCountryPressTarget;
}

interface GetBoundsAreaParams {
  bounds: MapBounds;
}

interface GetPressedMapViewerCountryParams {
  point: MapPoint;
  targets: readonly MapViewerCountryPressTarget[];
}

interface DoesPointMatchBoundsParams {
  bounds: MapBounds;
  point: MapPoint;
}

const MAP_VIEWER_COUNTRY_PRESS_VISUAL_PRIORITY = {
  active: 0,
  highlighted: 1,
} satisfies Record<MapViewerPathVisualState, number>;

export function buildMapViewerCountryPressTargets({
  activeTargets,
  highlights,
  pathResolution,
}: BuildMapViewerCountryPressTargetsParams): readonly MapViewerCountryPressTarget[] {
  return COUNTRIES.map((country) =>
    getMapViewerCountryPressTarget({
      activeTargets,
      country,
      highlights,
      pathResolution,
    }),
  )
    .filter(isMapViewerCountryPressTarget)
    .sort(compareMapViewerCountryPressTargets);
}

export function getPressedMapViewerCountry({
  point,
  targets,
}: GetPressedMapViewerCountryParams): Country | null {
  for (const target of targets) {
    if (
      !doesPointMatchBounds({
        bounds: target.bounds,
        point,
      })
    ) {
      continue;
    }

    if (!target.path.contains(point.x, point.y)) {
      continue;
    }

    return target.country;
  }

  return null;
}

function getMapViewerCountryPressTarget({
  activeTargets,
  country,
  highlights,
  pathResolution,
}: GetMapViewerCountryPressTargetParams): MapViewerCountryPressTarget | null {
  const visualState = getMapViewerCountryPressVisualState({
    activeTargets,
    country,
    highlights,
  });

  if (visualState === null) {
    return null;
  }

  const path = getCountryPressPath({
    country,
    pathResolution,
  });

  if (path === null) {
    return null;
  }

  return {
    bounds: getCountryPressBounds(country),
    country,
    path,
    visualState,
  };
}

function getMapViewerCountryPressVisualState({
  activeTargets,
  country,
  highlights,
}: GetMapViewerCountryPressVisualStateParams): MapViewerPathVisualState | null {
  if (isCountryDisabled(country.code)) {
    return null;
  }

  const isCountryHighlighted = highlights.some((highlight) =>
    doesMapViewerTargetMatchEntity({
      entity: country,
      target: highlight.target,
    }),
  );

  if (isCountryHighlighted) {
    return "highlighted";
  }

  const isCountryActive = activeTargets.some((target) =>
    doesMapViewerTargetMatchEntity({
      entity: country,
      target,
    }),
  );

  if (!isCountryActive) {
    return null;
  }

  return "active";
}

function getCountryPressPath({
  country,
  pathResolution,
}: GetCountryPressPathParams): SkPath | null {
  if (country.countryPressArea !== undefined) {
    return getCountryPressAreaPath({
      country,
    });
  }

  return getCountryMapPath({
    country,
    pathResolution,
  });
}

function getCountryPressBounds(country: Country): MapBounds {
  if (country.countryPressArea !== undefined) {
    return country.countryPressArea.bounds;
  }

  return country.map.bounds;
}

function compareMapViewerCountryPressTargets(
  leftTarget: MapViewerCountryPressTarget,
  rightTarget: MapViewerCountryPressTarget,
): number {
  const visualPriorityDifference =
    MAP_VIEWER_COUNTRY_PRESS_VISUAL_PRIORITY[rightTarget.visualState] -
    MAP_VIEWER_COUNTRY_PRESS_VISUAL_PRIORITY[leftTarget.visualState];

  if (visualPriorityDifference !== 0) {
    return visualPriorityDifference;
  }

  const pressAreaPriorityDifference =
    getCountryPressAreaPriority({ target: rightTarget }) -
    getCountryPressAreaPriority({ target: leftTarget });

  if (pressAreaPriorityDifference !== 0) {
    return pressAreaPriorityDifference;
  }

  return (
    getBoundsArea({
      bounds: leftTarget.bounds,
    }) -
    getBoundsArea({
      bounds: rightTarget.bounds,
    })
  );
}

function getCountryPressAreaPriority({
  target,
}: GetCountryPressAreaPriorityParams): number {
  if (target.country.countryPressArea !== undefined) {
    return 1;
  }

  return 0;
}

function getBoundsArea({ bounds }: GetBoundsAreaParams): number {
  return (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
}

function doesPointMatchBounds({
  bounds,
  point,
}: DoesPointMatchBoundsParams): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

function isMapViewerCountryPressTarget(
  value: MapViewerCountryPressTarget | null,
): value is MapViewerCountryPressTarget {
  return value !== null;
}
