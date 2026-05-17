import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Text } from "heroui-native/text";
import { Settings } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { BackButton } from "@/components/back-button";
import { Header } from "@/components/header/header";
import { ThemedIcon } from "@/services/theme/themed-icon";

interface LearnHeaderProps {
  title: string;
}

export function LearnHeader({ title }: LearnHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Header className="px-2">
      <Header.Left>
        <BackButton />
      </Header.Left>
      <Header.Center style={{ maxWidth: "60%" }}>
        <Text type="h2" align="center" truncate>
          {title}
        </Text>
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
  );
}
