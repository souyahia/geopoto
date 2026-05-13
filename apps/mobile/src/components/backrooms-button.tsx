import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { TreePalm } from "lucide-react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";
import { isLocalDev } from "@/utils/env";

export function BackroomsButton() {
  const router = useRouter();

  if (!isLocalDev) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      isIconOnly
      onPress={() => router.push("/backrooms")}
    >
      <ThemedIcon icon={TreePalm} />
    </Button>
  );
}
