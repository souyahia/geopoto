import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { cn } from "heroui-native/utils";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";

interface MenuCardProps {
  description: string;
  icon: LucideIcon;
  onPress?: () => void;
  title: string;
  isDisabled?: boolean;
}

export function MenuCard({
  description,
  icon,
  onPress,
  title,
  isDisabled,
}: MenuCardProps) {
  const card = (
    <Card
      className={cn("flex-row", isDisabled && "opacity-50")}
      variant={isDisabled ? "default" : "secondary"}
    >
      {!isDisabled && (
        <>
          <PressableFeedback.Highlight />
          <PressableFeedback.Ripple />
        </>
      )}
      <View className="pl-2 pr-5 items-center justify-center self-stretch">
        <ThemedIcon
          icon={icon}
          size={28}
          className={cn(isDisabled && "opacity-50")}
        />
      </View>
      <Card.Body className="flex-1">
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Body>
    </Card>
  );

  if (isDisabled) {
    return card;
  }

  return (
    <PressableFeedback
      animation={false}
      aria-label={title}
      className="self-stretch overflow-visible rounded-2xl"
      onPress={onPress}
    >
      <PressableFeedback.Scale>{card}</PressableFeedback.Scale>
    </PressableFeedback>
  );
}
