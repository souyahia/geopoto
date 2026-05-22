// oxlint-disable-next-line no-restricted-imports
import * as ExpoHaptics from "expo-haptics";
import { useMMKVBoolean } from "react-native-mmkv";

export function useHaptics() {
  const [isHapticFeedbackEnabled = true, setIsHapticFeedbackEnabledValue] =
    useMMKVBoolean("hapticsEnabled");

  const sendHapticImpact = (style: ExpoHaptics.ImpactFeedbackStyle) => {
    if (isHapticFeedbackEnabled) {
      void ExpoHaptics.impactAsync(style);
    }
  };

  const sendHapticNotification = (
    style: ExpoHaptics.NotificationFeedbackType,
  ) => {
    if (isHapticFeedbackEnabled) {
      void ExpoHaptics.notificationAsync(style);
    }
  };

  const setIsHapticFeedbackEnabled = (isEnabled: boolean) => {
    setIsHapticFeedbackEnabledValue(isEnabled);
    if (isEnabled) {
      void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleHaptics = () => {
    const isEnabled = !isHapticFeedbackEnabled;
    if (!isEnabled) {
      sendHapticImpact(ExpoHaptics.ImpactFeedbackStyle.Medium);
    }
    setIsHapticFeedbackEnabled(isEnabled);
  };

  return {
    isHapticFeedbackEnabled,
    setIsHapticFeedbackEnabled,
    toggleHaptics,
    sendHapticImpact,
    sendHapticNotification,
  };
}
