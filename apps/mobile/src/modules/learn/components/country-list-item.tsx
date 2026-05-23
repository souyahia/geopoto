import { ImpactFeedbackStyle } from "expo-haptics";
import { Card } from "heroui-native/card";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { FlagIcon } from "@/components/flag-icon";
import { useHaptics } from "@/services/haptics";
import { ThemedIcon } from "@/services/theme/themed-icon";

export const COUNTRY_LIST_ITEM_SEPARATOR_HEIGHT = 8;
export const COUNTRY_LIST_ITEM_TOTAL_HEIGHT = 70;

const COUNTRY_LIST_ITEM_HEIGHT =
  COUNTRY_LIST_ITEM_TOTAL_HEIGHT - COUNTRY_LIST_ITEM_SEPARATOR_HEIGHT;
const COUNTRY_LIST_ITEM_STYLE = {
  height: COUNTRY_LIST_ITEM_HEIGHT,
};

interface CountryListItemProps {
  code: string;
  name: string;
  onPress: () => void;
}

export function CountryListItem({ code, name, onPress }: CountryListItemProps) {
  const { sendHapticImpact } = useHaptics();

  const handlePress = () => {
    sendHapticImpact(ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      aria-label={name}
      className="self-stretch overflow-visible rounded-2xl"
      onPress={handlePress}
    >
      <Card
        className="flex-row items-center gap-3"
        style={COUNTRY_LIST_ITEM_STYLE}
        variant="secondary"
      >
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
    </Pressable>
  );
}
