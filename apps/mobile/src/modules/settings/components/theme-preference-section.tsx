import { Moon, Sun, SunMoon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { useThemePreference } from "@/services/theme/theme";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { SettingsSection } from "./settings-section";

const THEME_PREFERENCE_OPTIONS = [
  {
    icon: Sun,
    labelKey: "settings.theme.options.light",
    value: "light",
  },
  {
    icon: Moon,
    labelKey: "settings.theme.options.dark",
    value: "dark",
  },
  {
    icon: SunMoon,
    labelKey: "settings.theme.options.system",
    value: "system",
  },
] as const;

export function ThemePreferenceSection() {
  const { t } = useTranslation();
  const { themePreference, setThemePreference } = useThemePreference();

  return (
    <SettingsSection
      title={t("settings.theme.title")}
      description={t("settings.theme.description")}
    >
      <View className="flex-row gap-2">
        {THEME_PREFERENCE_OPTIONS.map((option) => {
          const isSelected = themePreference === option.value;
          const variant = isSelected ? "primary" : "tertiary";
          const iconColorClassName = isSelected
            ? "text-accent-foreground"
            : "text-default-foreground";

          return (
            <HapticButton
              key={option.value}
              size="sm"
              variant={variant}
              className="flex-1 px-2"
              accessibilityLabel={t(option.labelKey)}
              onPress={() => setThemePreference(option.value)}
            >
              <ThemedIcon
                icon={option.icon}
                size={18}
                colorClassName={iconColorClassName}
              />
              <HapticButton.Label className="text-center" numberOfLines={1}>
                {t(option.labelKey)}
              </HapticButton.Label>
            </HapticButton>
          );
        })}
      </View>
    </SettingsSection>
  );
}
