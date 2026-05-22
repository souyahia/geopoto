import { Switch } from "heroui-native/switch";
import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useHaptics } from "@/services/haptics";

import { SettingsSection } from "./settings-section";

export function HapticFeedbackSection() {
  const { t } = useTranslation();
  const { isHapticFeedbackEnabled, setIsHapticFeedbackEnabled } = useHaptics();

  const handleHapticFeedbackChange = (isSelected: boolean) => {
    setIsHapticFeedbackEnabled(isSelected);
  };

  return (
    <SettingsSection
      title={t("settings.haptic-feedback.title")}
      description={t("settings.haptic-feedback.description")}
    >
      <View className="flex-row items-center justify-between gap-4 px-1">
        <Text type="body-sm" className="flex-1 opacity-80">
          {t("settings.haptic-feedback.toggle-label")}
        </Text>
        <Switch
          accessibilityLabel={t("settings.haptic-feedback.toggle-label")}
          isSelected={isHapticFeedbackEnabled}
          onSelectedChange={handleHapticFeedbackChange}
        />
      </View>
    </SettingsSection>
  );
}
