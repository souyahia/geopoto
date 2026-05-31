import { Dialog } from "heroui-native/dialog";
import { Switch } from "heroui-native/switch";
import { Text } from "heroui-native/text";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { useAdaptiveDifficultySettings } from "@/modules/adaptive-difficulty/utils/adaptive-difficulty-settings-storage";
import { resetAdaptiveHistory } from "@/modules/adaptive-difficulty/utils/adaptive-history-storage";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { SettingsSection } from "./settings-section";

export function AdaptiveDifficultySection() {
  const { t } = useTranslation();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResettingAdaptiveHistory, setIsResettingAdaptiveHistory] =
    useState(false);
  const { isAdaptiveDifficultyEnabled, setIsAdaptiveDifficultyEnabled } =
    useAdaptiveDifficultySettings();

  const handleAdaptiveDifficultyChange = (isEnabled: boolean) => {
    setIsAdaptiveDifficultyEnabled(isEnabled);
  };

  const handleResetPress = () => {
    setIsResetDialogOpen(true);
  };

  const handleResetDialogOpenChange = (isOpen: boolean) => {
    setIsResetDialogOpen(isOpen);
  };

  const handleResetCancelPress = () => {
    setIsResetDialogOpen(false);
  };

  const handleResetConfirmPress = () => {
    setIsResettingAdaptiveHistory(true);

    void resetAdaptiveHistory()
      .then(() => {
        setIsResettingAdaptiveHistory(false);
        setIsResetDialogOpen(false);
      })
      .catch(() => {
        setIsResettingAdaptiveHistory(false);
      });
  };

  return (
    <Dialog
      isOpen={isResetDialogOpen}
      onOpenChange={handleResetDialogOpenChange}
    >
      <SettingsSection
        title={t("settings.adaptive-difficulty.title")}
        description={t("settings.adaptive-difficulty.description")}
      >
        <View className="flex-row items-center justify-between gap-4 px-1">
          <Text type="body-sm" className="flex-1 opacity-80">
            {t("settings.adaptive-difficulty.toggle-label")}
          </Text>
          <Switch
            accessibilityLabel={t("settings.adaptive-difficulty.toggle-label")}
            isSelected={isAdaptiveDifficultyEnabled}
            onSelectedChange={handleAdaptiveDifficultyChange}
          />
        </View>
        <HapticButton
          accessibilityLabel={t("settings.adaptive-difficulty.reset.label")}
          className="self-start"
          size="sm"
          variant="danger-soft"
          onPress={handleResetPress}
        >
          <ThemedIcon icon={Trash2} size={18} colorClassName="text-danger" />
          <HapticButton.Label>
            {t("settings.adaptive-difficulty.reset.label")}
          </HapticButton.Label>
        </HapticButton>
      </SettingsSection>
      <Dialog.Portal unstable_accessibilityContainerViewIsModal>
        <Dialog.Overlay />
        <Dialog.Content className="gap-5">
          <View className="gap-1.5">
            <Dialog.Title>
              {t("settings.adaptive-difficulty.reset.confirm-title")}
            </Dialog.Title>
            <Dialog.Description>
              {t("settings.adaptive-difficulty.reset.confirm-description")}
            </Dialog.Description>
          </View>
          <View className="flex-row justify-end gap-3">
            <HapticButton
              size="sm"
              variant="ghost"
              onPress={handleResetCancelPress}
            >
              {t("settings.adaptive-difficulty.reset.cancel-label")}
            </HapticButton>
            <HapticButton
              isDisabled={isResettingAdaptiveHistory}
              size="sm"
              variant="danger"
              onPress={handleResetConfirmPress}
            >
              {t("settings.adaptive-difficulty.reset.confirm-label")}
            </HapticButton>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
