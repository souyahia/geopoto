import { Button } from "heroui-native/button";
import { RotateCcw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedIcon } from "@/services/theme/themed-icon";

interface MapViewerResetButtonProps {
  isVisible: boolean;
  onPress?: () => void;
}

const RESET_BUTTON_FADE_DURATION = 160;
const RESET_BUTTON_FADE_IN = FadeIn.duration(RESET_BUTTON_FADE_DURATION);
const RESET_BUTTON_FADE_OUT = FadeOut.duration(RESET_BUTTON_FADE_DURATION);

export function MapViewerResetButton({
  isVisible,
  onPress,
}: MapViewerResetButtonProps) {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      className="m-3"
      entering={RESET_BUTTON_FADE_IN}
      exiting={RESET_BUTTON_FADE_OUT}
    >
      <Button
        aria-label={t("map-viewer.reset")}
        isIconOnly
        size="sm"
        variant="tertiary"
        onPress={onPress}
      >
        <ThemedIcon
          colorClassName="text-default-foreground"
          icon={RotateCcw}
          size={18}
        />
      </Button>
    </Animated.View>
  );
}
