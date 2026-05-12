import { createMMKV, useMMKVString } from "react-native-mmkv";

import {
  type AppThemePreference,
  isAppThemePreference,
} from "./theme-preference";

const themeStorage = createMMKV({ id: "theme-storage" });
const THEME_STORAGE_KEY = "user-theme";
const DEFAULT_APP_THEME_PREFERENCE: AppThemePreference = "system";

export function getStoredThemePreference(): AppThemePreference {
  const storedThemePreference = themeStorage.getString(THEME_STORAGE_KEY);

  if (!isAppThemePreference(storedThemePreference)) {
    return DEFAULT_APP_THEME_PREFERENCE;
  }

  return storedThemePreference;
}

export function useThemeStorage() {
  const [persistedThemePreference, setPersistedThemePreference] = useMMKVString(
    THEME_STORAGE_KEY,
    themeStorage,
  );

  return {
    persistedThemePreference: isAppThemePreference(persistedThemePreference)
      ? persistedThemePreference
      : DEFAULT_APP_THEME_PREFERENCE,
    setPersistedThemePreference,
  };
}
