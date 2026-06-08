import { Card } from "heroui-native/card";
import { Text } from "heroui-native/text";
import { View } from "react-native";

import { FlagIcon } from "@/components/flag-icon";

export const CAPITAL_LIST_ITEM_SEPARATOR_HEIGHT = 8;
export const CAPITAL_LIST_ITEM_TOTAL_HEIGHT = 78;

const CAPITAL_LIST_ITEM_HEIGHT =
  CAPITAL_LIST_ITEM_TOTAL_HEIGHT - CAPITAL_LIST_ITEM_SEPARATOR_HEIGHT;
const CAPITAL_LIST_ITEM_STYLE = {
  height: CAPITAL_LIST_ITEM_HEIGHT,
};

interface CapitalListItemProps {
  capitalName: string;
  code: string;
  countryName: string;
}

export function CapitalListItem({
  capitalName,
  code,
  countryName,
}: CapitalListItemProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${capitalName}, ${countryName}`}
      className="self-stretch overflow-visible rounded-2xl"
    >
      <Card
        className="flex-row items-center gap-3"
        style={CAPITAL_LIST_ITEM_STYLE}
        variant="secondary"
      >
        <View className="items-center justify-center">
          <FlagIcon
            code={code}
            containerClassName="border border-default"
            width={30}
          />
        </View>
        <Card.Body className="min-w-0 flex-1 px-0">
          <Text type="body" numberOfLines={1} className="font-semibold">
            {capitalName}
          </Text>
          <Text type="body-sm" color="muted" numberOfLines={1}>
            {countryName}
          </Text>
        </Card.Body>
      </Card>
    </View>
  );
}
