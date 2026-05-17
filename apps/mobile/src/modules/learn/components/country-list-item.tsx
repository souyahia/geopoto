import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { ChevronRight } from "lucide-react-native";
import { View } from "react-native";

import { FlagIcon } from "@/components/flag-icon";
import { ThemedIcon } from "@/services/theme/themed-icon";

interface CountryListItemProps {
  capital: string;
  code: string;
  name: string;
  onPress: () => void;
}

export function CountryListItem({ code, name, onPress }: CountryListItemProps) {
  return (
    <PressableFeedback
      animation={false}
      aria-label={name}
      className="self-stretch overflow-visible rounded-2xl"
      onPress={onPress}
    >
      <PressableFeedback.Scale>
        <Card className="flex-row items-center gap-3" variant="secondary">
          <PressableFeedback.Highlight />
          <PressableFeedback.Ripple />
          <View className="items-center justify-center">
            <FlagIcon code={code} width={30} />
          </View>
          <Card.Body className="min-w-0 flex-1 px-0">
            <Card.Title numberOfLines={1} className="text-md">
              {name} ({code})
            </Card.Title>
          </Card.Body>
          <ThemedIcon icon={ChevronRight} size={20} />
        </Card>
      </PressableFeedback.Scale>
    </PressableFeedback>
  );
}
