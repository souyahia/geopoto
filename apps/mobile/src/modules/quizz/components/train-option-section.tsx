import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import type { PropsWithChildren } from "react";
import { View } from "react-native";

interface TrainOptionSectionProps {
  description: string;
  title: string;
}

export function TrainOptionSection({
  children,
  description,
  title,
}: PropsWithChildren<TrainOptionSectionProps>) {
  return (
    <Surface variant="secondary" className="gap-4">
      <View className="gap-1">
        <Text type="h4">{title}</Text>
        <Text type="body-sm" color="muted">
          {description}
        </Text>
      </View>
      {children}
    </Surface>
  );
}
