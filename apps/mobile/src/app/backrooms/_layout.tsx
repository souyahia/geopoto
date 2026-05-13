import { Slot, useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Text } from "heroui-native/text";
import { X } from "lucide-react-native/icons";
import { View } from "react-native";

import { Header } from "@/components/header/header";
import { ThemedIcon } from "@/services/theme/themed-icon";

export default function BackroomsLayout() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  return (
    <View className="flex-1">
      <Header>
        <Header.Center>
          <Text>Backrooms</Text>
        </Header.Center>
        {canGoBack && (
          <Header.Right>
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => router.back()}
            >
              <ThemedIcon size={20} icon={X} />
            </Button>
          </Header.Right>
        )}
      </Header>
      <Slot />
    </View>
  );
}
