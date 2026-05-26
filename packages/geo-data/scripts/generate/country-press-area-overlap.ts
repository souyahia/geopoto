import type { MapBounds } from "../../src/map-definition.ts";
import type { CountryPressAreaShape, MapPoint } from "./country-press-area.ts";

export interface CountryPressAreaShapeEntry {
  countryCode: string;
  shape: CountryPressAreaShape;
}

export interface CountryPressAreaShapePair {
  left: CountryPressAreaShapeEntry;
  right: CountryPressAreaShapeEntry;
}

interface FindMeaningfulCountryPressAreaShapeOverlapsParams {
  shapeEntries: readonly CountryPressAreaShapeEntry[];
}

interface HasMeaningfulCountryPressAreaShapeOverlapParams {
  left: CountryPressAreaShape;
  right: CountryPressAreaShape;
}

interface HasMeaningfulCircleOverlapParams {
  left: Extract<CountryPressAreaShape, { kind: "circle" }>;
  right: Extract<CountryPressAreaShape, { kind: "circle" }>;
}

interface HasMeaningfulCirclePolygonOverlapParams {
  circle: Extract<CountryPressAreaShape, { kind: "circle" }>;
  polygon: Extract<CountryPressAreaShape, { kind: "polygon" }>;
}

interface HasMeaningfulPolygonOverlapParams {
  left: Extract<CountryPressAreaShape, { kind: "polygon" }>;
  right: Extract<CountryPressAreaShape, { kind: "polygon" }>;
}

interface GetCountryPressAreaShapeBoundsParams {
  shape: CountryPressAreaShape;
}

interface HasMeaningfulMapBoundsOverlapParams {
  left: MapBounds;
  right: MapBounds;
}

interface GetDistanceBetweenPointsParams {
  left: MapPoint;
  right: MapPoint;
}

interface MapSegment {
  end: MapPoint;
  start: MapPoint;
}

interface GetPolygonSegmentsParams {
  points: readonly MapPoint[];
}

interface HasPointStrictlyInsidePolygonParams {
  point: MapPoint;
  polygon: Extract<CountryPressAreaShape, { kind: "polygon" }>;
}

interface IsPointOnPolygonBoundaryParams {
  point: MapPoint;
  polygon: Extract<CountryPressAreaShape, { kind: "polygon" }>;
}

interface GetDistanceFromPointToSegmentParams {
  point: MapPoint;
  segment: MapSegment;
}

interface HasProperSegmentIntersectionParams {
  left: MapSegment;
  right: MapSegment;
}

interface HasOverlappingCollinearSegmentInteriorParams {
  leftPolygon: Extract<CountryPressAreaShape, { kind: "polygon" }>;
  leftSegment: MapSegment;
  rightPolygon: Extract<CountryPressAreaShape, { kind: "polygon" }>;
  rightSegment: MapSegment;
}

interface GetOverlappingCollinearSegmentMidpointParams {
  left: MapSegment;
  right: MapSegment;
}

interface IsSegmentCollinearWithSegmentParams {
  candidate: MapSegment;
  reference: MapSegment;
}

interface GetSegmentDominantAxisRangeParams {
  reference: MapSegment;
  segment: MapSegment;
}

interface SegmentAxisRange {
  max: number;
  min: number;
}

interface GetDominantAxisCoordinateParams {
  point: MapPoint;
  reference: MapSegment;
}

interface InterpolateSegmentPointParams {
  axisValue: number;
  segment: MapSegment;
}

interface GetPerpendicularOffsetPointsParams {
  point: MapPoint;
  segment: MapSegment;
}

interface GetSegmentLengthParams {
  segment: MapSegment;
}

interface GetSegmentPointOrientationParams {
  point: MapPoint;
  segment: MapSegment;
}

interface GetMapBoundsCenterParams {
  bounds: MapBounds;
}

const MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE = 0.01;
const COUNTRY_PRESS_AREA_OVERLAP_SAMPLE_OFFSET =
  MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE * 2;

export function findMeaningfulCountryPressAreaShapeOverlaps({
  shapeEntries,
}: FindMeaningfulCountryPressAreaShapeOverlapsParams): readonly CountryPressAreaShapePair[] {
  return shapeEntries.flatMap((left, index) =>
    shapeEntries
      .slice(index + 1)
      .filter((right) =>
        hasMeaningfulCountryPressAreaShapeOverlap({
          left: left.shape,
          right: right.shape,
        }),
      )
      .map((right) => ({ left, right })),
  );
}

export function hasMeaningfulCountryPressAreaShapeOverlap({
  left,
  right,
}: HasMeaningfulCountryPressAreaShapeOverlapParams): boolean {
  const hasOverlappingBounds = hasMeaningfulMapBoundsOverlap({
    left: getCountryPressAreaShapeBounds({ shape: left }),
    right: getCountryPressAreaShapeBounds({ shape: right }),
  });

  if (!hasOverlappingBounds) {
    return false;
  }

  if (left.kind === "circle" && right.kind === "circle") {
    return hasMeaningfulCircleOverlap({ left, right });
  }

  if (left.kind === "circle" && right.kind === "polygon") {
    return hasMeaningfulCirclePolygonOverlap({
      circle: left,
      polygon: right,
    });
  }

  if (left.kind === "polygon" && right.kind === "circle") {
    return hasMeaningfulCirclePolygonOverlap({
      circle: right,
      polygon: left,
    });
  }

  if (left.kind === "polygon" && right.kind === "polygon") {
    return hasMeaningfulPolygonOverlap({ left, right });
  }

  return false;
}

function hasMeaningfulCircleOverlap({
  left,
  right,
}: HasMeaningfulCircleOverlapParams): boolean {
  const distance = getDistanceBetweenPoints({
    left: left.center,
    right: right.center,
  });

  return (
    distance <
    left.radius + right.radius - MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE
  );
}

function hasMeaningfulCirclePolygonOverlap({
  circle,
  polygon,
}: HasMeaningfulCirclePolygonOverlapParams): boolean {
  const hasCenterInsidePolygon = hasPointStrictlyInsidePolygon({
    point: circle.center,
    polygon,
  });

  if (hasCenterInsidePolygon) {
    return true;
  }

  const hasVertexInsideCircle = polygon.points.some(
    (point) =>
      getDistanceBetweenPoints({ left: circle.center, right: point }) <
      circle.radius - MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE,
  );

  if (hasVertexInsideCircle) {
    return true;
  }

  return getPolygonSegments({ points: polygon.points }).some(
    (segment) =>
      getDistanceFromPointToSegment({ point: circle.center, segment }) <
      circle.radius - MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE,
  );
}

function hasMeaningfulPolygonOverlap({
  left,
  right,
}: HasMeaningfulPolygonOverlapParams): boolean {
  const hasLeftPointInsideRight = left.points.some((point) =>
    hasPointStrictlyInsidePolygon({ point, polygon: right }),
  );

  if (hasLeftPointInsideRight) {
    return true;
  }

  const hasRightPointInsideLeft = right.points.some((point) =>
    hasPointStrictlyInsidePolygon({ point, polygon: left }),
  );

  if (hasRightPointInsideLeft) {
    return true;
  }

  const hasLeftCenterInsideRight = hasPointStrictlyInsidePolygon({
    point: getMapBoundsCenter({
      bounds: getCountryPressAreaShapeBounds({ shape: left }),
    }),
    polygon: right,
  });

  if (hasLeftCenterInsideRight) {
    return true;
  }

  const hasRightCenterInsideLeft = hasPointStrictlyInsidePolygon({
    point: getMapBoundsCenter({
      bounds: getCountryPressAreaShapeBounds({ shape: right }),
    }),
    polygon: left,
  });

  if (hasRightCenterInsideLeft) {
    return true;
  }

  const leftSegments = getPolygonSegments({ points: left.points });
  const rightSegments = getPolygonSegments({ points: right.points });
  const hasSegmentIntersection = leftSegments.some((leftSegment) =>
    rightSegments.some((rightSegment) =>
      hasProperSegmentIntersection({
        left: leftSegment,
        right: rightSegment,
      }),
    ),
  );

  if (hasSegmentIntersection) {
    return true;
  }

  return leftSegments.some((leftSegment) =>
    rightSegments.some((rightSegment) =>
      hasOverlappingCollinearSegmentInterior({
        leftPolygon: left,
        leftSegment,
        rightPolygon: right,
        rightSegment,
      }),
    ),
  );
}

function getCountryPressAreaShapeBounds({
  shape,
}: GetCountryPressAreaShapeBoundsParams): MapBounds {
  if (shape.kind === "circle") {
    return {
      maxX: shape.center.x + shape.radius,
      maxY: shape.center.y + shape.radius,
      minX: shape.center.x - shape.radius,
      minY: shape.center.y - shape.radius,
    };
  }

  return {
    maxX: Math.max(...shape.points.map(({ x }) => x)),
    maxY: Math.max(...shape.points.map(({ y }) => y)),
    minX: Math.min(...shape.points.map(({ x }) => x)),
    minY: Math.min(...shape.points.map(({ y }) => y)),
  };
}

function hasMeaningfulMapBoundsOverlap({
  left,
  right,
}: HasMeaningfulMapBoundsOverlapParams): boolean {
  return (
    left.minX < right.maxX - MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
    left.maxX > right.minX + MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
    left.minY < right.maxY - MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
    left.maxY > right.minY + MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE
  );
}

function getDistanceBetweenPoints({
  left,
  right,
}: GetDistanceBetweenPointsParams): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function getPolygonSegments({
  points,
}: GetPolygonSegmentsParams): readonly MapSegment[] {
  return points.map((point, index) => {
    const end = points[(index + 1) % points.length];

    if (end === undefined) {
      throw new Error(
        "Generation invariant failed: Country Press Area polygon has no segment end.",
      );
    }

    return {
      end,
      start: point,
    };
  });
}

function hasPointStrictlyInsidePolygon({
  point,
  polygon,
}: HasPointStrictlyInsidePolygonParams): boolean {
  if (isPointOnPolygonBoundary({ point, polygon })) {
    return false;
  }

  let isInside = false;

  for (const segment of getPolygonSegments({ points: polygon.points })) {
    const { end, start } = segment;
    const hasRayIntersection =
      start.y > point.y !== end.y > point.y &&
      point.x <
        ((end.x - start.x) * (point.y - start.y)) / (end.y - start.y) + start.x;

    if (hasRayIntersection) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function isPointOnPolygonBoundary({
  point,
  polygon,
}: IsPointOnPolygonBoundaryParams): boolean {
  return getPolygonSegments({ points: polygon.points }).some(
    (segment) =>
      getDistanceFromPointToSegment({ point, segment }) <=
      MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE,
  );
}

function getDistanceFromPointToSegment({
  point,
  segment,
}: GetDistanceFromPointToSegmentParams): number {
  const segmentWidth = segment.end.x - segment.start.x;
  const segmentHeight = segment.end.y - segment.start.y;
  const segmentLengthSquared =
    segmentWidth * segmentWidth + segmentHeight * segmentHeight;

  if (segmentLengthSquared === 0) {
    return getDistanceBetweenPoints({
      left: point,
      right: segment.start,
    });
  }

  const segmentOffset =
    ((point.x - segment.start.x) * segmentWidth +
      (point.y - segment.start.y) * segmentHeight) /
    segmentLengthSquared;
  const clampedSegmentOffset = Math.max(0, Math.min(1, segmentOffset));

  return getDistanceBetweenPoints({
    left: point,
    right: {
      x: segment.start.x + clampedSegmentOffset * segmentWidth,
      y: segment.start.y + clampedSegmentOffset * segmentHeight,
    },
  });
}

function hasProperSegmentIntersection({
  left,
  right,
}: HasProperSegmentIntersectionParams): boolean {
  const leftStartOrientation = getSegmentPointOrientation({
    point: right.start,
    segment: left,
  });
  const leftEndOrientation = getSegmentPointOrientation({
    point: right.end,
    segment: left,
  });
  const rightStartOrientation = getSegmentPointOrientation({
    point: left.start,
    segment: right,
  });
  const rightEndOrientation = getSegmentPointOrientation({
    point: left.end,
    segment: right,
  });
  const isRightAcrossLeft =
    (leftStartOrientation > MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
      leftEndOrientation < -MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE) ||
    (leftStartOrientation < -MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
      leftEndOrientation > MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE);
  const isLeftAcrossRight =
    (rightStartOrientation > MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
      rightEndOrientation < -MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE) ||
    (rightStartOrientation < -MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
      rightEndOrientation > MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE);

  return isRightAcrossLeft && isLeftAcrossRight;
}

function hasOverlappingCollinearSegmentInterior({
  leftPolygon,
  leftSegment,
  rightPolygon,
  rightSegment,
}: HasOverlappingCollinearSegmentInteriorParams): boolean {
  const midpoint = getOverlappingCollinearSegmentMidpoint({
    left: leftSegment,
    right: rightSegment,
  });

  if (midpoint === undefined) {
    return false;
  }

  return getPerpendicularOffsetPoints({
    point: midpoint,
    segment: leftSegment,
  }).some(
    (point) =>
      hasPointStrictlyInsidePolygon({ point, polygon: leftPolygon }) &&
      hasPointStrictlyInsidePolygon({ point, polygon: rightPolygon }),
  );
}

function getOverlappingCollinearSegmentMidpoint({
  left,
  right,
}: GetOverlappingCollinearSegmentMidpointParams): MapPoint | undefined {
  const isRightCollinearWithLeft = isSegmentCollinearWithSegment({
    candidate: right,
    reference: left,
  });
  const isLeftCollinearWithRight = isSegmentCollinearWithSegment({
    candidate: left,
    reference: right,
  });

  if (!isRightCollinearWithLeft || !isLeftCollinearWithRight) {
    return undefined;
  }

  const leftRange = getSegmentDominantAxisRange({
    reference: left,
    segment: left,
  });
  const rightRange = getSegmentDominantAxisRange({
    reference: left,
    segment: right,
  });
  const overlapMin = Math.max(leftRange.min, rightRange.min);
  const overlapMax = Math.min(leftRange.max, rightRange.max);
  const overlapLength = overlapMax - overlapMin;

  if (overlapLength <= MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE) {
    return undefined;
  }

  return interpolateSegmentPoint({
    axisValue: overlapMin + overlapLength / 2,
    segment: left,
  });
}

function isSegmentCollinearWithSegment({
  candidate,
  reference,
}: IsSegmentCollinearWithSegmentParams): boolean {
  const referenceLength = getSegmentLength({ segment: reference });

  if (referenceLength <= MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE) {
    return false;
  }

  const startOrientation = Math.abs(
    getSegmentPointOrientation({
      point: candidate.start,
      segment: reference,
    }),
  );
  const endOrientation = Math.abs(
    getSegmentPointOrientation({
      point: candidate.end,
      segment: reference,
    }),
  );

  return (
    startOrientation / referenceLength <=
      MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE &&
    endOrientation / referenceLength <=
      MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE
  );
}

function getSegmentDominantAxisRange({
  reference,
  segment,
}: GetSegmentDominantAxisRangeParams): SegmentAxisRange {
  const start = getDominantAxisCoordinate({
    point: segment.start,
    reference,
  });
  const end = getDominantAxisCoordinate({
    point: segment.end,
    reference,
  });

  return {
    max: Math.max(start, end),
    min: Math.min(start, end),
  };
}

function getDominantAxisCoordinate({
  point,
  reference,
}: GetDominantAxisCoordinateParams): number {
  const width = Math.abs(reference.end.x - reference.start.x);
  const height = Math.abs(reference.end.y - reference.start.y);
  const shouldUseX = width >= height;

  if (shouldUseX) {
    return point.x;
  }

  return point.y;
}

function interpolateSegmentPoint({
  axisValue,
  segment,
}: InterpolateSegmentPointParams): MapPoint {
  const width = segment.end.x - segment.start.x;
  const height = segment.end.y - segment.start.y;
  const shouldUseX = Math.abs(width) >= Math.abs(height);
  const axisStart = shouldUseX ? segment.start.x : segment.start.y;
  const axisDistance = shouldUseX ? width : height;

  if (
    Math.abs(axisDistance) <= MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE
  ) {
    return {
      x: segment.start.x + width / 2,
      y: segment.start.y + height / 2,
    };
  }

  const ratio = (axisValue - axisStart) / axisDistance;

  return {
    x: segment.start.x + width * ratio,
    y: segment.start.y + height * ratio,
  };
}

function getPerpendicularOffsetPoints({
  point,
  segment,
}: GetPerpendicularOffsetPointsParams): readonly MapPoint[] {
  const width = segment.end.x - segment.start.x;
  const height = segment.end.y - segment.start.y;
  const length = getSegmentLength({ segment });

  if (length <= MEANINGFUL_COUNTRY_PRESS_AREA_OVERLAP_TOLERANCE) {
    return [];
  }

  const offsetX = (-height / length) * COUNTRY_PRESS_AREA_OVERLAP_SAMPLE_OFFSET;
  const offsetY = (width / length) * COUNTRY_PRESS_AREA_OVERLAP_SAMPLE_OFFSET;

  return [
    {
      x: point.x + offsetX,
      y: point.y + offsetY,
    },
    {
      x: point.x - offsetX,
      y: point.y - offsetY,
    },
  ];
}

function getSegmentLength({ segment }: GetSegmentLengthParams): number {
  return Math.hypot(
    segment.end.x - segment.start.x,
    segment.end.y - segment.start.y,
  );
}

function getSegmentPointOrientation({
  point,
  segment,
}: GetSegmentPointOrientationParams): number {
  return (
    (segment.end.x - segment.start.x) * (point.y - segment.start.y) -
    (segment.end.y - segment.start.y) * (point.x - segment.start.x)
  );
}

function getMapBoundsCenter({ bounds }: GetMapBoundsCenterParams): MapPoint {
  return {
    x: bounds.minX + (bounds.maxX - bounds.minX) / 2,
    y: bounds.minY + (bounds.maxY - bounds.minY) / 2,
  };
}
