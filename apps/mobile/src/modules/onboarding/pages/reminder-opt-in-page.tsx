import { useRouter } from "expo-router";
import { Text } from "heroui-native/text";
import { BellRing } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { PageContent } from "@/components/page-content";
import { useDailyChallengeReminderSettings } from "@/modules/daily-challenge-reminder/hooks/use-daily-challenge-reminder-settings";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { useOnboardingCompletion } from "../hooks/use-onboarding-completion";

export function ReminderOptInPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setIsOnboardingCompleted } = useOnboardingCompletion();
  const [isCompletingOnboarding, setIsCompletingOnboarding] = useState(false);
  const notificationContent = useMemo(
    () => ({
      body: t("settings.daily-challenge-reminder.notification.body"),
      channelName: t(
        "settings.daily-challenge-reminder.notification.channel-name",
      ),
      title: t("settings.daily-challenge-reminder.notification.title"),
    }),
    [t],
  );
  const {
    isDailyChallengeReminderUpdating,
    setIsDailyChallengeReminderEnabled,
  } = useDailyChallengeReminderSettings({ content: notificationContent });
  const shouldDisableEnableButton =
    isCompletingOnboarding || isDailyChallengeReminderUpdating;
  const shouldDisableSkipButton =
    isCompletingOnboarding || isDailyChallengeReminderUpdating;

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    router.replace("/home");
  };

  const handleEnablePress = async () => {
    setIsCompletingOnboarding(true);

    try {
      await setIsDailyChallengeReminderEnabled(true);
    } finally {
      completeOnboarding();
    }
  };

  const handleSkipPress = async () => {
    setIsCompletingOnboarding(true);

    try {
      await setIsDailyChallengeReminderEnabled(false);
    } finally {
      completeOnboarding();
    }
  };

  return (
    <PageContent className="flex-1 items-center justify-center gap-6 px-6 py-safe">
      <View className="items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
          <ThemedIcon
            icon={BellRing}
            size={30}
            colorClassName="text-foreground"
          />
        </View>
        <View className="items-center gap-2">
          <Text type="h2" className="text-center">
            {t("onboarding.reminder-opt-in.title")}
          </Text>
          <Text type="body-sm" className="px-4 text-center" color="muted">
            {t("onboarding.reminder-opt-in.description")}
          </Text>
        </View>
      </View>
      <View className="w-full gap-3">
        <HapticButton
          accessibilityLabel={t("onboarding.reminder-opt-in.enable-label")}
          isDisabled={shouldDisableEnableButton}
          onPress={() => {
            void handleEnablePress();
          }}
          variant="primary"
        >
          <ThemedIcon icon={BellRing} size={18} />
          <HapticButton.Label>
            {t("onboarding.reminder-opt-in.enable-label")}
          </HapticButton.Label>
        </HapticButton>
        <HapticButton
          accessibilityLabel={t("onboarding.reminder-opt-in.skip-label")}
          isDisabled={shouldDisableSkipButton}
          onPress={() => {
            void handleSkipPress();
          }}
          variant="ghost"
        >
          <HapticButton.Label>
            {t("onboarding.reminder-opt-in.skip-label")}
          </HapticButton.Label>
        </HapticButton>
      </View>
    </PageContent>
  );
}
