import { Text } from "heroui-native/text";
import { cn } from "heroui-native/utils";
import { Heart } from "lucide-react-native";
import { View } from "react-native";

import { ThemedIcon } from "@/services/theme/themed-icon";

const PALESTINE_COUNTRY_CODE = "PS";
const FREE_PALESTINE_LABEL = "Free Palestine";
const FREE_PALESTINE_HEART_COLOR = "#E4312B";
const FREE_PALESTINE_HEART_SIZE = 14;

interface FreePalestineBadgeProps {
  countryCode: string;
  className?: string;
}

export function FreePalestineBadge({
  countryCode,
  className,
}: FreePalestineBadgeProps) {
  if (countryCode !== PALESTINE_COUNTRY_CODE) {
    return null;
  }

  return (
    <View
      accessibilityLabel={FREE_PALESTINE_LABEL}
      className={cn(
        "flex-row items-center gap-1 rounded-full bg-surface-tertiary px-2 py-1",
        className,
      )}
    >
      <ThemedIcon
        color={FREE_PALESTINE_HEART_COLOR}
        fill={FREE_PALESTINE_HEART_COLOR}
        icon={Heart}
        size={FREE_PALESTINE_HEART_SIZE}
      />
      <Text type="body-xs" weight="semibold" className="leading-4">
        {FREE_PALESTINE_LABEL}
      </Text>
    </View>
  );
}
