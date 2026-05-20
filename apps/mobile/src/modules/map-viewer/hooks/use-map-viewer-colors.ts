import { useCSSVariable } from "uniwind";

interface MapViewerColors {
  activeCountryBackgroundColor: string;
  activeCountryBorderColor: string;
  countryBackgroundColor: string;
  countryBorderColor: string;
  highlightBackgroundColor: string;
  highlightBorderColor: string;
}

const MAP_VIEWER_FALLBACK_COLORS: MapViewerColors = {
  activeCountryBackgroundColor: "#fef5ff",
  activeCountryBorderColor: "#b6a0b8",
  countryBackgroundColor: "#e6d7ea",
  countryBorderColor: "#b6a0b8",
  highlightBackgroundColor: "#ffd36a",
  highlightBorderColor: "#9b4f00",
};

export function useMapViewerColors(): MapViewerColors {
  const [
    activeCountryBackgroundColorValue,
    activeCountryBorderColorValue,
    countryBackgroundColorValue,
    countryBorderColorValue,
    highlightBackgroundColorValue,
    highlightBorderColorValue,
  ] = useCSSVariable([
    "--map-active-country-background",
    "--map-active-country-border",
    "--map-country-background",
    "--map-country-border",
    "--map-highlight-background",
    "--map-highlight-border",
  ]);

  return {
    activeCountryBackgroundColor: getColorVariable(
      activeCountryBackgroundColorValue,
      MAP_VIEWER_FALLBACK_COLORS.activeCountryBackgroundColor,
    ),
    activeCountryBorderColor: getColorVariable(
      activeCountryBorderColorValue,
      MAP_VIEWER_FALLBACK_COLORS.activeCountryBorderColor,
    ),
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
