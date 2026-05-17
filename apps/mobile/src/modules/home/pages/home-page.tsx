import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { BookOpenText, Dumbbell, Settings, Trophy } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AssetImage, ASSET_IMAGES } from "@/components/asset-image";
import { BackroomsButton } from "@/components/backrooms-button";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { GameModeButton } from "../components/game-mode-button";

export function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="flex-1 p-safe">
      <View className="flex-row items-center justify-end p-4 gap-2">
        <BackroomsButton />
        <Button
          variant="ghost"
          aria-label={t("home.settings")}
          isIconOnly
          onPress={() => router.push("/settings")}
        >
          <ThemedIcon icon={Settings} />
        </Button>
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
        <GameModeButton
          icon={Trophy}
          title={t("home.game-modes.challenge.title")}
          description=""
          isComingSoon
        />
        <GameModeButton
          icon={Dumbbell}
          title={t("home.game-modes.train.title")}
          description={t("home.game-modes.train.description")}
        />
        <GameModeButton
          icon={BookOpenText}
          title={t("home.game-modes.learn.title")}
          description={t("home.game-modes.learn.description")}
          onPress={() => router.push("/learn")}
        />
      </View>
    </View>
  );
}
