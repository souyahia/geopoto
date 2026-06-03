import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PageContent } from "@/components/page-content";

import { LangButton } from "../components/lang-button";

export function OnboardingPage() {
  const { t } = useTranslation();

  return (
    <PageContent className="flex-1 items-center justify-center gap-4 px-6 py-safe">
      <Text type="h2">{t("onboarding.language.title")}</Text>
      <Text type="body-sm" className="px-4">
        {t("onboarding.language.description")}
      </Text>
      <View className="flex-row gap-4">
        <View className="gap-4">
          <LangButton locale="en" />
          <LangButton locale="fr" />
          <LangButton locale="de" />
        </View>
        <View className="gap-4">
          <LangButton locale="es" />
          <LangButton locale="it" />
          <LangButton locale="pt" />
        </View>
      </View>
    </PageContent>
  );
}
