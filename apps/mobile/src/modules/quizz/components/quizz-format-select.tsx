import { FieldError } from "heroui-native/field-error";
import { Select } from "heroui-native/select";
import { Text } from "heroui-native/text";
import {
  Check,
  Flag,
  Landmark,
  ListChecks,
  MapPinned,
  Type,
  type LucideIcon,
} from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { ThemedIcon } from "@/services/theme/themed-icon";

import {
  isQuizzFormat,
  QUIZZ_ANSWER_FORMATS,
  QUIZZ_FORMATS,
  type QuizzFormat,
} from "../utils/quizz";

type SelectedTrainSelectOption =
  | {
      label: string;
      value: string;
    }
  | undefined;

interface QuizzFormatOption {
  icon: LucideIcon;
  labelKey: QuizzFormatLabelKey;
  value: QuizzFormat;
}

type QuizzFormatLabelKey =
  | "train.formats.country-name"
  | "train.formats.country-capital"
  | "train.formats.country-flag"
  | "train.formats.country-position";

const QUIZZ_FORMAT_OPTIONS = [
  {
    icon: Type,
    labelKey: "train.formats.country-name",
    value: "country-name",
  },
  {
    icon: Landmark,
    labelKey: "train.formats.country-capital",
    value: "country-capital",
  },
  {
    icon: Flag,
    labelKey: "train.formats.country-flag",
    value: "country-flag",
  },
  {
    icon: MapPinned,
    labelKey: "train.formats.country-position",
    value: "country-position",
  },
] satisfies readonly QuizzFormatOption[];

export const DEFAULT_QUIZZ_FORMATS = QUIZZ_FORMAT_OPTIONS.map(
  (option) => option.value,
);
export const DEFAULT_QUIZZ_ANSWER_FORMATS = [...QUIZZ_ANSWER_FORMATS];

interface QuizzFormatDisplayOption {
  icon: LucideIcon;
  label: string;
  value: QuizzFormat;
}

interface QuizzFormatSelectProps {
  accessibilityLabel: string;
  errorMessage?: string;
  availableFormats?: readonly QuizzFormat[];
  isInvalid: boolean;
  label: string;
  onSelectedFormatsChange: (formats: QuizzFormat[]) => void;
  selectedFormats: readonly QuizzFormat[];
}

export function QuizzFormatSelect({
  accessibilityLabel,
  availableFormats = QUIZZ_FORMATS,
  errorMessage,
  isInvalid,
  label,
  onSelectedFormatsChange,
  selectedFormats,
}: QuizzFormatSelectProps) {
  const { t } = useTranslation();
  const hasAllFormatsSelected =
    selectedFormats.length === availableFormats.length;
  const displayFormatOptions = useMemo(
    () =>
      QUIZZ_FORMAT_OPTIONS.filter((option) =>
        availableFormats.includes(option.value),
      ).map((option) => ({
        icon: option.icon,
        label: t(option.labelKey),
        value: option.value,
      })),
    [availableFormats, t],
  );
  const selectedFormatOptions = useMemo(
    () =>
      displayFormatOptions.filter((option) =>
        selectedFormats.includes(option.value),
      ),
    [displayFormatOptions, selectedFormats],
  );
  const triggerLabel = hasAllFormatsSelected
    ? t("train.format-select.all")
    : t("train.format-select.selected", { count: selectedFormats.length });

  const handleValueChange = useCallback(
    (options: SelectedTrainSelectOption[]) => {
      const formats = toQuizzFormats({
        availableFormats,
        options,
      });

      if (formats.length === 0) {
        return;
      }

      onSelectedFormatsChange(formats);
    },
    [availableFormats, onSelectedFormatsChange],
  );

  return (
    <View className="gap-2">
      <Select
        onValueChange={handleValueChange}
        selectionMode="multiple"
        value={selectedFormatOptions}
      >
        <Select.Trigger
          accessibilityLabel={accessibilityLabel}
          className={[
            "bg-surface-tertiary",
            isInvalid ? "border border-danger" : "",
          ].join(" ")}
        >
          <ThemedIcon icon={ListChecks} size={20} />
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
            <Select.ListLabel className="px-4 pb-2 pt-2">
              {label}
            </Select.ListLabel>
            {displayFormatOptions.map((option) => (
              <QuizzFormatSelectItem key={option.value} option={option} />
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
      <FieldError isInvalid={isInvalid}>{errorMessage}</FieldError>
    </View>
  );
}

interface QuizzFormatSelectItemProps {
  option: QuizzFormatDisplayOption;
}

function QuizzFormatSelectItem({ option }: QuizzFormatSelectItemProps) {
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
            <QuizzFormatSelectionMark isSelected={isSelected} />
            <ThemedIcon icon={option.icon} size={18} />
            <Select.ItemLabel />
          </View>
        )}
      </Select.Item>
    </HapticPressableFeedback>
  );
}

interface QuizzFormatSelectionMarkProps {
  isSelected: boolean;
}

function QuizzFormatSelectionMark({
  isSelected,
}: QuizzFormatSelectionMarkProps) {
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

interface ToQuizzFormatsParams {
  availableFormats: readonly QuizzFormat[];
  options: readonly SelectedTrainSelectOption[];
}

function toQuizzFormats({ availableFormats, options }: ToQuizzFormatsParams) {
  return options
    .map((option) => option?.value)
    .filter(isQuizzFormat)
    .filter((format) => availableFormats.includes(format));
}
