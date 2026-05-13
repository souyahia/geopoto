import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { ArrowLeft } from "lucide-react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";

export function BackButton() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  if (!canGoBack) {
    return null;
  }

  return (
    <Button variant="ghost" isIconOnly onPress={() => router.back()}>
      <ThemedIcon icon={ArrowLeft} />
    </Button>
  );
}
