import { geoCentroid } from "d3-geo";
import type { Feature, Polygon } from "geojson";

import type { CountryFeature, RawGeometryProperties } from "./types.ts";

export interface GeographicBounds {
  maxLatitude: number;
  maxLongitude: number;
  minLatitude: number;
  minLongitude: number;
}

interface DoesPointMatchGeographicBoundsParams {
  bounds: GeographicBounds;
  latitude: number;
  longitude: number;
}

interface DoesPolygonMatchGeographicBoundsParams {
  bounds: GeographicBounds;
  coordinates: Polygon["coordinates"];
  sourceName: string;
}

interface ExtractSourceFeaturePartsParams {
  boundsList: readonly GeographicBounds[];
  code: string;
  feature: CountryFeature | null;
  sourceName: string;
}

interface ExcludeSourceFeaturePartsParams {
  boundsList: readonly GeographicBounds[];
  feature: CountryFeature | null;
  sourceName: string;
}

interface DoesPolygonMatchAnyGeographicBoundsParams {
  boundsList: readonly GeographicBounds[];
  coordinates: Polygon["coordinates"];
  sourceName: string;
}

interface BuildFeatureFromPolygonCoordinatesParams {
  coordinatesList: readonly Polygon["coordinates"][];
  feature: CountryFeature;
}

interface FindMatchingCoordinatesByBoundsParams {
  bounds: GeographicBounds;
  coordinatesList: readonly Polygon["coordinates"][];
  sourceName: string;
}

function doesPointMatchGeographicBounds({
  bounds,
  latitude,
  longitude,
}: DoesPointMatchGeographicBoundsParams): boolean {
  return (
    longitude >= bounds.minLongitude &&
    longitude <= bounds.maxLongitude &&
    latitude >= bounds.minLatitude &&
    latitude <= bounds.maxLatitude
  );
}

function doesPolygonMatchGeographicBounds({
  bounds,
  coordinates,
  sourceName,
}: DoesPolygonMatchGeographicBoundsParams): boolean {
  const polygonFeature: Feature<Polygon, RawGeometryProperties> = {
    geometry: {
      coordinates,
      type: "Polygon",
    },
    properties: {
      name: sourceName,
    },
    type: "Feature",
  };
  const [longitude, latitude] = geoCentroid(polygonFeature);

  return doesPointMatchGeographicBounds({
    bounds,
    latitude,
    longitude,
  });
}

function doesPolygonMatchAnyGeographicBounds({
  boundsList,
  coordinates,
  sourceName,
}: DoesPolygonMatchAnyGeographicBoundsParams): boolean {
  return boundsList.some((bounds) =>
    doesPolygonMatchGeographicBounds({
      bounds,
      coordinates,
      sourceName,
    }),
  );
}

function buildFeatureFromPolygonCoordinates({
  coordinatesList,
  feature,
}: BuildFeatureFromPolygonCoordinatesParams): CountryFeature | null {
  if (coordinatesList.length === 0) {
    return null;
  }

  const firstCoordinates = coordinatesList[0];

  if (coordinatesList.length === 1 && firstCoordinates !== undefined) {
    return {
      ...feature,
      geometry: {
        coordinates: firstCoordinates,
        type: "Polygon",
      },
    };
  }

  return {
    ...feature,
    geometry: {
      coordinates: coordinatesList.map((coordinates) => coordinates),
      type: "MultiPolygon",
    },
  };
}

function findMatchingCoordinatesByBounds({
  bounds,
  coordinatesList,
  sourceName,
}: FindMatchingCoordinatesByBoundsParams): readonly Polygon["coordinates"][] {
  return coordinatesList.filter((coordinates) =>
    doesPolygonMatchGeographicBounds({
      bounds,
      coordinates,
      sourceName,
    }),
  );
}

export function extractSourceFeatureParts({
  boundsList,
  code,
  feature,
  sourceName,
}: ExtractSourceFeaturePartsParams): CountryFeature | null {
  if (feature === null) {
    return null;
  }

  if (boundsList.length === 0) {
    return null;
  }

  if (feature.geometry.type === "Polygon") {
    const polygonCoordinates = feature.geometry.coordinates;
    const hasUnresolvedBounds = boundsList.some(
      (bounds) =>
        !doesPolygonMatchGeographicBounds({
          bounds,
          coordinates: polygonCoordinates,
          sourceName,
        }),
    );

    if (hasUnresolvedBounds) {
      return null;
    }

    return {
      ...feature,
      properties: {
        ...feature.properties,
        name: code,
      },
    };
  }

  if (feature.geometry.type !== "MultiPolygon") {
    return null;
  }

  const sourceCoordinatesList = feature.geometry.coordinates;
  const matchingCoordinatesByBounds = boundsList.map((bounds) =>
    findMatchingCoordinatesByBounds({
      bounds,
      coordinatesList: sourceCoordinatesList,
      sourceName,
    }),
  );
  const hasUnresolvedBounds = matchingCoordinatesByBounds.some(
    (coordinatesList) => coordinatesList.length === 0,
  );

  if (hasUnresolvedBounds) {
    return null;
  }

  const coordinatesList = Array.from(
    new Set(matchingCoordinatesByBounds.flat()),
  );
  const extractedFeature = buildFeatureFromPolygonCoordinates({
    coordinatesList,
    feature,
  });

  if (extractedFeature === null) {
    return null;
  }

  return {
    ...extractedFeature,
    properties: {
      ...extractedFeature.properties,
      name: code,
    },
  };
}

export function excludeSourceFeatureParts({
  boundsList,
  feature,
  sourceName,
}: ExcludeSourceFeaturePartsParams): CountryFeature | null {
  if (feature === null) {
    return null;
  }

  if (feature.geometry.type === "Polygon") {
    const isExcludedPolygon = doesPolygonMatchAnyGeographicBounds({
      boundsList,
      coordinates: feature.geometry.coordinates,
      sourceName,
    });

    if (isExcludedPolygon) {
      return null;
    }

    return feature;
  }

  if (feature.geometry.type !== "MultiPolygon") {
    return feature;
  }

  const coordinatesList = feature.geometry.coordinates.filter(
    (coordinates) =>
      !doesPolygonMatchAnyGeographicBounds({
        boundsList,
        coordinates,
        sourceName,
      }),
  );

  return buildFeatureFromPolygonCoordinates({
    coordinatesList,
    feature,
  });
}
