import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import type { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";

interface CountryInfoSectionProps {
  title: string;
}

interface CountryInfoRowProps {
  label: string;
  value: ReactNode;
}

export function CountryInfoSection({
  children,
  title,
}: PropsWithChildren<CountryInfoSectionProps>) {
  return (
    <Surface variant="secondary" className="gap-4">
      <Text type="h4">{title}</Text>
      <View className="gap-3">{children}</View>
    </Surface>
  );
}

export function CountryInfoRow({ label, value }: CountryInfoRowProps) {
  return (
    <View className="gap-1">
      <Text type="body-xs" color="muted">
        {label}
      </Text>
      <Text type="body" className="leading-6">
        {value}
      </Text>
    </View>
  );
}
