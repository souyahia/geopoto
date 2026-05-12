import { useEffect } from "react";
import { Uniwind } from "uniwind";

import { getStoredThemePreference, useThemeStorage } from "./theme-storage";

const initialAppTheme = getStoredThemePreference();
Uniwind.setTheme(initialAppTheme);

export function useSyncThemePreference() {
  const { persistedThemePreference } = useThemeStorage();

  useEffect(() => {
    Uniwind.setTheme(persistedThemePreference);
  }, [persistedThemePreference]);
}
