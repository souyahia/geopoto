import { ImpactFeedbackStyle } from "expo-haptics";
import {
  Button as HeroButton,
  type ButtonRootProps,
} from "heroui-native/button";
import type { GestureResponderEvent } from "react-native";

import { useHaptics } from "@/services/haptics";
import { usePressGuard } from "@/utils/use-press-guard";

type HapticButtonProps = ButtonRootProps & {
  hapticImpactStyle?: ImpactFeedbackStyle;
};

const HapticButtonRoot = ({
  hapticImpactStyle = ImpactFeedbackStyle.Light,
  ...props
}: HapticButtonProps) => {
  const { sendHapticImpact } = useHaptics();

  const handlePress = usePressGuard({
    onPress: (event: GestureResponderEvent) => {
      sendHapticImpact(hapticImpactStyle);

      if (typeof props.onPress === "function") {
        props.onPress(event);
      }
    },
  });

  return <HeroButton {...props} onPress={handlePress} />;
};
HapticButtonRoot.displayName = "HapticButton";

export const HapticButton = Object.assign(HapticButtonRoot, {
  Label: HeroButton.Label,
});

export type { ButtonRootProps };
