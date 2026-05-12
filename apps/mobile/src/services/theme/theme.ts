import { useCallback } from "react";
import { Uniwind, useUniwind } from "uniwind";

import type { AppThemePreference } from "./theme-preference";
import { useThemeStorage } from "./theme-storage";

export function useAppTheme() {
  const { theme } = useUniwind();
  return { theme };
}

export function useThemePreference() {
  const { persistedThemePreference, setPersistedThemePreference } =
    useThemeStorage();

  const setThemePreference = useCallback(
    (value: AppThemePreference) => {
      Uniwind.setTheme(value);
      setPersistedThemePreference(value);
    },
    [setPersistedThemePreference],
  );

  return {
    setThemePreference,
    themePreference: persistedThemePreference,
  };
}
