import { useCSSVariable } from "uniwind";

interface MapViewerColors {
  countryBackgroundColor: string;
  countryBorderColor: string;
  highlightBackgroundColor: string;
  highlightBorderColor: string;
}

const MAP_VIEWER_FALLBACK_COLORS: MapViewerColors = {
  countryBackgroundColor: "#d8e5dc",
  countryBorderColor: "#9faea5",
  highlightBackgroundColor: "#ffd36a",
  highlightBorderColor: "#9b4f00",
};

export function useMapViewerColors(): MapViewerColors {
  const [
    countryBackgroundColorValue,
    countryBorderColorValue,
    highlightBackgroundColorValue,
    highlightBorderColorValue,
  ] = useCSSVariable([
    "--map-country-background",
    "--map-country-border",
    "--map-highlight-background",
    "--map-highlight-border",
  ]);

  return {
    countryBackgroundColor: getColorVariable(
      countryBackgroundColorValue,
      MAP_VIEWER_FALLBACK_COLORS.countryBackgroundColor,
    ),
    countryBorderColor: getColorVariable(
      countryBorderColorValue,
      MAP_VIEWER_FALLBACK_COLORS.countryBorderColor,
    ),
    highlightBackgroundColor: getColorVariable(
      highlightBackgroundColorValue,
      MAP_VIEWER_FALLBACK_COLORS.highlightBackgroundColor,
    ),
    highlightBorderColor: getColorVariable(
      highlightBorderColorValue,
      MAP_VIEWER_FALLBACK_COLORS.highlightBorderColor,
    ),
  };
}

function getColorVariable(
  value: number | string | undefined,
  fallback: string,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}
