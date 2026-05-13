import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { cn } from "heroui-native/utils";
import type { LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";

interface GameModeButtonProps {
  icon: LucideIcon;
  title?: string;
  description?: string;
  onPress?: () => void;
  isComingSoon?: boolean;
}

export function GameModeButton({
  icon,
  title,
  description,
  onPress,
  isComingSoon,
}: GameModeButtonProps) {
  const { t } = useTranslation();
  const isDisabled = isComingSoon;

  return (
    <PressableFeedback
      animation={false}
      onPress={onPress}
      aria-label={title}
      className={cn("self-stretch overflow-auto", isComingSoon && "opacity-50")}
      isDisabled={isDisabled}
    >
      <PressableFeedback.Scale>
        <Card
          className="flex-row"
          variant={isComingSoon ? "default" : "secondary"}
        >
          {!isDisabled && (
            <>
              <PressableFeedback.Highlight />
              <PressableFeedback.Ripple />
            </>
          )}
          <View className="pr-3 items-center justify-center self-stretch">
            <ThemedIcon
              icon={icon}
              size={28}
              className={cn(isComingSoon && "opacity-50")}
            />
          </View>
          <Card.Body className="flex-1">
            <Card.Title>{title}</Card.Title>
            <Card.Description>
              {isComingSoon ? t("home.game-modes.coming-soon") : description}
            </Card.Description>
          </Card.Body>
        </Card>
      </PressableFeedback.Scale>
    </PressableFeedback>
  );
}
