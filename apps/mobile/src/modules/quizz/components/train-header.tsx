import { useRouter } from "expo-router";
import { Text } from "heroui-native/text";
import { Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { BackButton } from "@/components/back-button";
import { HapticButton } from "@/components/haptic-button";
import { Header } from "@/components/header/header";
import { ThemedIcon } from "@/services/theme/themed-icon";

export function TrainHeader() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Header className="px-2">
      <Header.Left>
        <BackButton />
      </Header.Left>
      <Header.Center style={{ maxWidth: "60%" }}>
        <Text type="h2" align="center" truncate>
          {t("train.title")}
        </Text>
      </Header.Center>
      <Header.Right>
        <HapticButton
          variant="ghost"
          aria-label={t("train.settings")}
          isIconOnly
          onPress={() => router.push("/settings")}
        >
          <ThemedIcon icon={Settings} />
        </HapticButton>
      </Header.Right>
    </Header>
  );
}
