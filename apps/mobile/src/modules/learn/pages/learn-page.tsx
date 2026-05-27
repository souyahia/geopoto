import { useRouter } from "expo-router";
import { Building2, Flag, Map, ScrollText } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { MenuCard } from "@/components/menu-card";

import { LearnHeader } from "../components/learn-header";

export function LearnPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 p-safe">
      <LearnHeader title={t("learn.title")} />
      <ScrollView className="flex-1">
        <View className="gap-4 px-6 pb-8 pt-4">
          <MenuCard
            icon={Map}
            title={t("learn.menu-cards.map.title")}
            description={t("learn.menu-cards.map.description")}
            onPress={() => router.push("/learn/map")}
          />
          <MenuCard
            icon={Flag}
            title={t("learn.menu-cards.flags.title")}
            description={t("learn.menu-cards.flags.description")}
            onPress={() => router.push("/learn/flags")}
          />
          <MenuCard
            icon={ScrollText}
            title={t("learn.menu-cards.countries.title")}
            description={t("learn.menu-cards.countries.description")}
            onPress={() => router.push("/learn/countries")}
          />
          <MenuCard
            icon={Building2}
            title={t("learn.menu-cards.capitals.title")}
            description={t("learn.menu-cards.capitals.description")}
            onPress={() => router.push("/learn/capitals")}
          />
        </View>
      </ScrollView>
    </View>
  );
}
