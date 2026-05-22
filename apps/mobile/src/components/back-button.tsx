import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { HapticButton } from "@/components/haptic-button";
import { ThemedIcon } from "@/services/theme/themed-icon";

export function BackButton() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  if (!canGoBack) {
    return null;
  }

  return (
    <HapticButton variant="ghost" isIconOnly onPress={() => router.back()}>
      <ThemedIcon icon={ArrowLeft} />
    </HapticButton>
  );
}
