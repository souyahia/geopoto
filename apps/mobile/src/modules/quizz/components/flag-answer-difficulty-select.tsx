import { Select } from "heroui-native/select";
import { Check, Flag } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { ThemedIcon } from "@/services/theme/themed-icon";

import {
  isFlagAnswerDifficulty,
  type FlagAnswerDifficulty,
} from "../utils/quizz";

interface FlagAnswerDifficultyOption {
  labelKey: FlagAnswerDifficultyLabelKey;
  value: FlagAnswerDifficulty;
}

type FlagAnswerDifficultyLabelKey =
  | "train.flag-answer-difficulty.options.easy"
  | "train.flag-answer-difficulty.options.hard";

interface SelectedTrainSelectOption {
  label: string;
  value: string;
}

interface FlagAnswerDifficultyDisplayOption {
  label: string;
  value: FlagAnswerDifficulty;
}

const FLAG_ANSWER_DIFFICULTY_OPTIONS = [
  {
    labelKey: "train.flag-answer-difficulty.options.easy",
    value: "easy",
  },
  {
    labelKey: "train.flag-answer-difficulty.options.hard",
    value: "hard",
  },
] satisfies readonly FlagAnswerDifficultyOption[];

interface FlagAnswerDifficultySelectProps {
  isDisabled: boolean;
  onSelectedFlagAnswerDifficultyChange: (value: FlagAnswerDifficulty) => void;
  selectedFlagAnswerDifficulty: FlagAnswerDifficulty;
}

export function FlagAnswerDifficultySelect({
  isDisabled,
  onSelectedFlagAnswerDifficultyChange,
  selectedFlagAnswerDifficulty,
}: FlagAnswerDifficultySelectProps) {
  const { t } = useTranslation();
  const flagAnswerDifficultyOptions = useMemo(
    () =>
      FLAG_ANSWER_DIFFICULTY_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
  const selectedFlagAnswerDifficultyOption =
    getSelectedFlagAnswerDifficultyOption({
      flagAnswerDifficultyOptions,
      selectedFlagAnswerDifficulty,
    });

  const handleValueChange = useCallback(
    (option: SelectedTrainSelectOption | undefined) => {
      if (!isFlagAnswerDifficulty(option?.value)) {
        return;
      }

      onSelectedFlagAnswerDifficultyChange(option.value);
    },
    [onSelectedFlagAnswerDifficultyChange],
  );

  return (
    <Select
      isDisabled={isDisabled}
      value={selectedFlagAnswerDifficultyOption}
      onValueChange={handleValueChange}
    >
      <Select.Trigger
        accessibilityLabel={t("train.flag-answer-difficulty.select-label")}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={Flag} size={20} />
        <Select.Value
          placeholder={t("train.flag-answer-difficulty.placeholder")}
        />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger" className="px-0">
          <Select.ListLabel className="px-4 pb-2 pt-2">
            {t("train.flag-answer-difficulty.select-label")}
          </Select.ListLabel>
          {flagAnswerDifficultyOptions.map((option) => (
            <HapticPressableFeedback key={option.value} asChild>
              <Select.Item
                value={option.value}
                label={option.label}
                className="px-4"
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <ThemedIcon icon={Flag} size={18} />
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator className="pr-3">
                  <ThemedIcon icon={Check} />
                </Select.ItemIndicator>
              </Select.Item>
            </HapticPressableFeedback>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  );
}

interface GetSelectedFlagAnswerDifficultyOptionParams {
  flagAnswerDifficultyOptions: readonly FlagAnswerDifficultyDisplayOption[];
  selectedFlagAnswerDifficulty: FlagAnswerDifficulty;
}

function getSelectedFlagAnswerDifficultyOption({
  flagAnswerDifficultyOptions,
  selectedFlagAnswerDifficulty,
}: GetSelectedFlagAnswerDifficultyOptionParams) {
  return flagAnswerDifficultyOptions.find(
    (option) => option.value === selectedFlagAnswerDifficulty,
  );
}
