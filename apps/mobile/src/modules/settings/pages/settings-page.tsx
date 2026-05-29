import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { BackButton } from "@/components/back-button";
import { BackroomsButton } from "@/components/backrooms-button";
import { Header } from "@/components/header/header";

import { DailyChallengeReminderSection } from "../components/daily-challenge-reminder-section";
import { HapticFeedbackSection } from "../components/haptic-feedback-section";
import { LanguageSection } from "../components/language-section";
import { ThemePreferenceSection } from "../components/theme-preference-section";

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 p-safe">
      <Header className="px-2">
        <Header.Left>
          <BackButton />
        </Header.Left>
        <Header.Center>
          <Text type="h2">{t("settings.title")}</Text>
        </Header.Center>
        <Header.Right>
          <BackroomsButton />
        </Header.Right>
      </Header>
      <ScrollView className="flex-1">
        <View className="gap-4 px-6 pb-8 pt-4">
          <ThemePreferenceSection />
          <DailyChallengeReminderSection />
          <LanguageSection />
          <HapticFeedbackSection />
        </View>
      </ScrollView>
    </View>
  );
}
