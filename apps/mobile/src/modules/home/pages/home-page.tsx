import { useRouter } from "expo-router";
import { BookOpenText, Dumbbell, Settings, Trophy } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AssetImage, ASSET_IMAGES } from "@/components/asset-image";
import { BackroomsButton } from "@/components/backrooms-button";
import { HapticButton } from "@/components/haptic-button";
import { MenuCard } from "@/components/menu-card";
import { ThemedIcon } from "@/services/theme/themed-icon";

export function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 p-safe">
      <View className="flex-row items-center justify-end p-4 gap-2">
        <BackroomsButton />
        <HapticButton
          variant="ghost"
          aria-label={t("home.settings")}
          isIconOnly
          onPress={() => router.push("/settings")}
        >
          <ThemedIcon icon={Settings} />
        </HapticButton>
      </View>
      <View className="items-center justify-center px-8 pb-2">
        <AssetImage
          image={ASSET_IMAGES.GEOPOTO_ILLUSTRATION}
          contentFit="contain"
          style={{
            width: "95%",
            maxWidth: 400,
          }}
        />
      </View>
      <View className="flex-1 items-center px-10 py-4 justify-stretch gap-4">
        <MenuCard
          icon={Trophy}
          title={t("home.game-modes.challenge.title")}
          description={t("home.game-modes.coming-soon")}
          isDisabled
        />
        <MenuCard
          icon={Dumbbell}
          title={t("home.game-modes.train.title")}
          description={t("home.game-modes.train.description")}
          onPress={() => router.push("/train")}
        />
        <MenuCard
          icon={BookOpenText}
          title={t("home.game-modes.learn.title")}
          description={t("home.game-modes.learn.description")}
          onPress={() => router.push("/learn")}
        />
      </View>
    </View>
  );
}
