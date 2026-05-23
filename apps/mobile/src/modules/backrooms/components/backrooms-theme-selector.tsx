import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { useThemePreference } from "@/services/theme/theme";
import type { AppThemePreference } from "@/services/theme/theme-preference";
import { APP_THEME_PREFERENCES } from "@/services/theme/theme-preference";

const themeOptionLabels: Record<AppThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function BackroomsThemeSelector() {
  const { themePreference, setThemePreference } = useThemePreference();

  return (
    <View className="flex-row items-center justify-center gap-2">
      {APP_THEME_PREFERENCES.map((option) => (
        <HapticButton
          key={option}
          variant={themePreference === option ? "primary" : "outline"}
          onPress={() => setThemePreference(option)}
        >
          {themeOptionLabels[option]}
        </HapticButton>
      ))}
    </View>
  );
}
