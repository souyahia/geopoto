import { Button } from "heroui-native/button";
import { View } from "react-native";

import { BackroomsThemeSelector } from "../components/backrooms-theme-selector";

export function BackroomsPage() {
  return (
    <View className="flex-1 items-center px-6 py-2 gap-2">
      <BackroomsThemeSelector />
      <Button variant="primary">Primary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-soft">Danger Soft</Button>
    </View>
  );
}
