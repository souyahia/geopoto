import { Card } from "heroui-native/card";
import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";

interface LearnModeCardProps {
  description: string;
  icon: LucideIcon;
  title: string;
}

export function LearnModeCard({
  description,
  icon,
  title,
}: LearnModeCardProps) {
  return (
    <Card className="flex-row" variant="secondary">
      <View className="pl-2 pr-5 items-center justify-center self-stretch">
        <ThemedIcon icon={icon} size={28} />
      </View>
      <Card.Body className="flex-1">
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Body>
    </Card>
  );
}
