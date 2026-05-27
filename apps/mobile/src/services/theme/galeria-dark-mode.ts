import { useCallback } from "react";
import { Appearance, Platform } from "react-native";

import type { AppThemePreference } from "./theme-preference";
import { useThemeStorage } from "./theme-storage";

function restoreColorSchemeForThemePreference(
  themePreference: AppThemePreference,
) {
  if (Platform.OS !== "ios") {
    return;
  }

  if (themePreference === "system") {
    Appearance.setColorScheme("unspecified");
    return;
  }

  Appearance.setColorScheme(themePreference);
}

export function useGaleriaDarkMode() {
  const { persistedThemePreference } = useThemeStorage();

  const enableGaleriaDarkMode = useCallback(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    Appearance.setColorScheme("dark");
  }, []);

  const restoreAppColorScheme = useCallback(() => {
    restoreColorSchemeForThemePreference(persistedThemePreference);
  }, [persistedThemePreference]);

  return {
    enableGaleriaDarkMode,
    restoreAppColorScheme,
  };
}
