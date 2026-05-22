import { ImpactFeedbackStyle } from "expo-haptics";
import {
  PressableFeedback as HeroPressableFeedback,
  type PressableFeedbackProps,
} from "heroui-native/pressable-feedback";
import type { GestureResponderEvent } from "react-native";

import { useHaptics } from "@/services/haptics";

type HapticPressableFeedbackProps = PressableFeedbackProps & {
  hapticImpactStyle?: ImpactFeedbackStyle;
};

const HapticPressableFeedbackRoot = ({
  hapticImpactStyle = ImpactFeedbackStyle.Light,
  ...props
}: HapticPressableFeedbackProps) => {
  const { sendHapticImpact } = useHaptics();

  const handlePress = (event: GestureResponderEvent) => {
    sendHapticImpact(hapticImpactStyle);

    if (typeof props.onPress === "function") {
      props.onPress(event);
    }
  };

  return <HeroPressableFeedback {...props} onPress={handlePress} />;
};
HapticPressableFeedbackRoot.displayName = "HapticPressableFeedback";

export const HapticPressableFeedback = Object.assign(
  HapticPressableFeedbackRoot,
  {
    Highlight: HeroPressableFeedback.Highlight,
    Ripple: HeroPressableFeedback.Ripple,
    Scale: HeroPressableFeedback.Scale,
  },
);
