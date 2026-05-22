import { useRouter } from "expo-router";
import { TreePalm } from "lucide-react-native";

import { HapticButton } from "@/components/haptic-button";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { isLocalDev } from "@/utils/env";

export function BackroomsButton() {
  const router = useRouter();

  if (!isLocalDev) {
    return null;
  }

  return (
    <HapticButton
      variant="ghost"
      isIconOnly
      onPress={() => router.push("/backrooms")}
    >
      <ThemedIcon icon={TreePalm} />
    </HapticButton>
  );
}
