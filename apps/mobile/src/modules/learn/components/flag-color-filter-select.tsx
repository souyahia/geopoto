import { Select, useSelect } from "heroui-native/select";
import { Text } from "heroui-native/text";
import { Check, Palette, X } from "lucide-react-native";
import { useCallback, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import {
  COUNTRY_FLAG_COLORS,
  type CountryFlagColor,
} from "@geopoto/geo-data/flag-colors";

import { HapticButton } from "@/components/haptic-button";
import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { ThemedIcon } from "@/services/theme/themed-icon";

interface FlagColorFilterSelectProps {
  onSelectedColorsChange: (colors: readonly CountryFlagColor[]) => void;
  selectedColors: readonly CountryFlagColor[];
}

interface ColorFilterSelectOption {
  label: string;
  swatchColor: string;
  value: CountryFlagColor;
}

type ColorFilterSelectedOption =
  | {
      label: string;
      value: string;
    }
  | undefined;

const FLAG_COLOR_SWATCH_BY_COLOR = {
  black: "#111111",
  blue: "#2563eb",
  brown: "#8b5e34",
  gray: "#8a8f98",
  green: "#16a34a",
  orange: "#f97316",
  purple: "#9333ea",
  red: "#dc2626",
  white: "#ffffff",
  yellow: "#facc15",
} satisfies Readonly<Record<CountryFlagColor, string>>;

export function FlagColorFilterSelect({
  onSelectedColorsChange,
  selectedColors,
}: FlagColorFilterSelectProps) {
  const { t } = useTranslation();
  const hasSelectedColors = selectedColors.length > 0;

  const colorOptions = useMemo(
    () =>
      COUNTRY_FLAG_COLORS.map((color) => ({
        label: t(`learn.flags.colors.options.${color}`),
        swatchColor: FLAG_COLOR_SWATCH_BY_COLOR[color],
        value: color,
      })),
    [t],
  );

  const selectedColorOptions = useMemo(
    () =>
      colorOptions.filter((option) => selectedColors.includes(option.value)),
    [colorOptions, selectedColors],
  );

  const triggerLabel = hasSelectedColors
    ? t("learn.flags.colors.selected", { count: selectedColors.length })
    : t("learn.flags.colors.placeholder");

  const handleValueChange = useCallback(
    (options: ColorFilterSelectedOption[]) => {
      onSelectedColorsChange(
        options.map((option) => option?.value).filter(isCountryFlagColor),
      );
    },
    [onSelectedColorsChange],
  );

  const handleClearPress = useCallback(() => {
    onSelectedColorsChange([]);
  }, [onSelectedColorsChange]);

  return (
    <Select
      onValueChange={handleValueChange}
      selectionMode="multiple"
      value={selectedColorOptions}
    >
      <Select.Trigger
        accessibilityLabel={t("learn.flags.colors.trigger-label")}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={Palette} size={20} />
        <Text type="body" className="flex-1" numberOfLines={1}>
          {triggerLabel}
        </Text>
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay animation="disabled" />
        <Select.Content
          animation="disabled"
          presentation="popover"
          width="trigger"
          className="px-0"
        >
          <FlagColorFilterSelectContent
            clearLabel={t("learn.flags.colors.clear")}
            hasSelectedColors={hasSelectedColors}
            label={t("learn.flags.colors.label")}
            onClearPress={handleClearPress}
            options={colorOptions}
          />
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}

interface FlagColorFilterSelectContentProps {
  clearLabel: string;
  hasSelectedColors: boolean;
  label: string;
  onClearPress: () => void;
  options: readonly ColorFilterSelectOption[];
}

function FlagColorFilterSelectContent({
  clearLabel,
  hasSelectedColors,
  label,
  onClearPress,
  options,
}: FlagColorFilterSelectContentProps) {
  return (
    <>
      <Select.ListLabel className="px-4 pb-2 pt-2">{label}</Select.ListLabel>
      {options.map((option) => (
        <FlagColorFilterSelectItem key={option.value} option={option} />
      ))}
      {hasSelectedColors && (
        <View className="px-3 pb-2 pt-2">
          <FlagColorFilterClearButton onClearPress={onClearPress}>
            {clearLabel}
          </FlagColorFilterClearButton>
        </View>
      )}
    </>
  );
}

interface FlagColorFilterClearButtonProps {
  children: ReactNode;
  onClearPress: () => void;
}

function FlagColorFilterClearButton({
  children,
  onClearPress,
}: FlagColorFilterClearButtonProps) {
  const { onOpenChange } = useSelect();

  const handlePress = useCallback(() => {
    onClearPress();
    onOpenChange(false);
  }, [onClearPress, onOpenChange]);

  return (
    <HapticButton
      className="w-full"
      onPress={handlePress}
      size="md"
      variant="tertiary"
    >
      <ThemedIcon icon={X} size={18} colorClassName="text-default-foreground" />
      <HapticButton.Label>{children}</HapticButton.Label>
    </HapticButton>
  );
}

interface FlagColorFilterSelectItemProps {
  option: ColorFilterSelectOption;
}

function FlagColorFilterSelectItem({ option }: FlagColorFilterSelectItemProps) {
  return (
    <HapticPressableFeedback asChild>
      <Select.Item
        closeOnPress={false}
        className="px-4"
        label={option.label}
        value={option.value}
      >
        {({ isSelected }) => (
          <View className="flex-1 flex-row items-center gap-3">
            <FlagColorFilterSelectionMark isSelected={isSelected} />
            <View
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: option.swatchColor }}
            />
            <Select.ItemLabel />
          </View>
        )}
      </Select.Item>
    </HapticPressableFeedback>
  );
}

interface FlagColorFilterSelectionMarkProps {
  isSelected: boolean;
}

function FlagColorFilterSelectionMark({
  isSelected,
}: FlagColorFilterSelectionMarkProps) {
  return (
    <View
      className={[
        "size-6 items-center justify-center rounded-lg border",
        isSelected ? "border-accent bg-accent" : "border-border bg-field",
      ].join(" ")}
      pointerEvents="none"
    >
      {isSelected && (
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={Check}
          size={16}
          strokeWidth={3}
        />
      )}
    </View>
  );
}

function isCountryFlagColor(
  value: string | undefined,
): value is CountryFlagColor {
  switch (value) {
    case "black":
    case "blue":
    case "brown":
    case "gray":
    case "green":
    case "orange":
    case "purple":
    case "red":
    case "white":
    case "yellow":
      return true;
    case undefined:
      return false;
    default:
      return false;
  }
}
