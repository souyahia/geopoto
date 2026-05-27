import { Slot, useRouter } from "expo-router";
import { Text } from "heroui-native/text";
import { X } from "lucide-react-native/icons";
import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";
import { Header } from "@/components/header/header";
import { ThemedIcon } from "@/services/theme/themed-icon";

export default function BackroomsLayout() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  return (
    <View className="flex-1 pt-4">
      <Header>
        <Header.Center>
          <Text>Backrooms</Text>
        </Header.Center>
        {canGoBack && (
          <Header.Right className="pr-2">
            <HapticButton
              size="sm"
              variant="ghost"
              isIconOnly
              onPress={() => router.back()}
            >
              <ThemedIcon size={20} icon={X} />
            </HapticButton>
          </Header.Right>
        )}
      </Header>
      <Slot />
    </View>
  );
}
