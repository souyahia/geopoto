export const APP_THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type AppThemePreference = (typeof APP_THEME_PREFERENCES)[number];

export function isAppThemePreference(
  value: unknown,
): value is AppThemePreference {
  if (typeof value !== "string") {
    return false;
  }

  return APP_THEME_PREFERENCES.some(
    (themePreference) => themePreference === value,
  );
}
