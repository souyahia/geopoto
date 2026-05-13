import { AccordionLayoutTransition } from "heroui-native/accordion";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import type { PropsWithChildren } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

interface SettingsSectionProps {
  description: string;
  title: string;
}

export function SettingsSection({
  children,
  description,
  title,
}: PropsWithChildren<SettingsSectionProps>) {
  return (
    <Surface variant="secondary" className="gap-4" asChild>
      <Animated.View layout={AccordionLayoutTransition}>
        <View className="gap-1">
          <Text type="h4">{title}</Text>
          <Text type="body-sm" color="muted">
            {description}
          </Text>
        </View>
        {children}
      </Animated.View>
    </Surface>
  );
}
