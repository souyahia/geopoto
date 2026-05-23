import { View } from "react-native";

import { HapticButton } from "@/components/haptic-button";

import { BackroomsThemeSelector } from "../components/backrooms-theme-selector";

export function BackroomsPage() {
  return (
    <View className="flex-1 items-center px-6 py-2 gap-2">
      <BackroomsThemeSelector />
      <HapticButton variant="primary">Primary</HapticButton>
      <HapticButton variant="tertiary">Tertiary</HapticButton>
      <HapticButton variant="outline">Outline</HapticButton>
      <HapticButton variant="ghost">Ghost</HapticButton>
      <HapticButton variant="danger">Danger</HapticButton>
      <HapticButton variant="danger-soft">Danger Soft</HapticButton>
    </View>
  );
}
