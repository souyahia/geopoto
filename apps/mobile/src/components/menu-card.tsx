import { Card } from "heroui-native/card";
import { cn } from "heroui-native/utils";
import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { ThemedIcon } from "@/services/theme/themed-icon";

interface MenuCardProps {
  description: string;
  icon: LucideIcon;
  onPress?: () => void;
  title: string;
  titleAccessory?: ReactNode;
  isDisabled?: boolean;
}

export function MenuCard({
  description,
  icon,
  onPress,
  title,
  titleAccessory,
  isDisabled,
}: MenuCardProps) {
  const card = (
    <Card
      className={cn("flex-row", isDisabled && "opacity-50")}
      variant={isDisabled ? "default" : "secondary"}
    >
      {!isDisabled && (
        <>
          <HapticPressableFeedback.Highlight />
          <HapticPressableFeedback.Ripple />
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
        {titleAccessory === undefined ? (
          <Card.Title>{title}</Card.Title>
        ) : (
          <View className="min-w-0 flex-row items-center gap-2">
            <Card.Title
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className="min-w-0 shrink leading-6"
            >
              {title}
            </Card.Title>
            {titleAccessory}
          </View>
        )}
        <Card.Description>{description}</Card.Description>
      </Card.Body>
    </Card>
  );

  if (isDisabled) {
    return card;
  }

  return (
    <HapticPressableFeedback
      animation={false}
      aria-label={title}
      className="self-stretch overflow-visible rounded-2xl"
      onPress={onPress}
    >
      <HapticPressableFeedback.Scale>{card}</HapticPressableFeedback.Scale>
    </HapticPressableFeedback>
  );
}
