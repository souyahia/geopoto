import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Text } from "heroui-native/text";
import {
  BookOpenText,
  Building2,
  Flag,
  Map,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { BackButton } from "@/components/back-button";
import { Header } from "@/components/header/header";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { LearnModeCard } from "../components/learn-mode-card";

type LearnModeKey = "map" | "flags" | "countries" | "capitals";

interface LearnModeOption {
  icon: LucideIcon;
  key: LearnModeKey;
}

const LEARN_MODE_OPTIONS: readonly LearnModeOption[] = [
  {
    icon: Map,
    key: "map",
  },
  {
    icon: Flag,
    key: "flags",
  },
  {
    icon: BookOpenText,
    key: "countries",
  },
  {
    icon: Building2,
    key: "capitals",
  },
];

export function LearnPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 p-safe">
      <Header className="px-2">
        <Header.Left>
          <BackButton />
        </Header.Left>
        <Header.Center>
          <Text type="h2">{t("learn.title")}</Text>
        </Header.Center>
        <Header.Right>
          <Button
            variant="ghost"
            aria-label={t("learn.settings")}
            isIconOnly
            onPress={() => router.push("/settings")}
          >
            <ThemedIcon icon={Settings} />
          </Button>
        </Header.Right>
      </Header>
      <ScrollView className="flex-1">
        <View className="gap-4 px-6 pb-8 pt-4">
          {LEARN_MODE_OPTIONS.map((option) => (
            <LearnModeCard
              key={option.key}
              icon={option.icon}
              title={t(`learn.modes.${option.key}.title`)}
              description={t(`learn.modes.${option.key}.description`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
