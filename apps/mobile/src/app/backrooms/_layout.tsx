import { Slot, useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Text } from "heroui-native/text";
import { X } from "lucide-react-native/icons";
import { View } from "react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";

export default function BackroomsLayout() {
  const router = useRouter();
  const hasNavigationHistory = router.canGoBack();

  return (
    <View className="flex-1">
      <View className="relative h-12 flex-row items-center justify-end self-stretch px-4">
        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          <Text>Backrooms</Text>
        </View>
        {hasNavigationHistory && (
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => router.back()}
          >
            <ThemedIcon size={20} icon={X} />
          </Button>
        )}
      </View>
      <Slot />
    </View>
  );
}
