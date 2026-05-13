import { Text } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { BackButton } from "@/components/back-button";
import { BackroomsButton } from "@/components/backrooms-button";
import { Header } from "@/components/header/header";

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
      <View className="flex-1 items-center justify-center">
        <Text>Settings</Text>
      </View>
    </View>
  );
}
