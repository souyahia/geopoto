import { Select } from "heroui-native/select";
import { Check, Gauge } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { isAnswerDifficulty, type AnswerDifficulty } from "../utils/quizz";

interface AnswerDifficultyOption {
  labelKey: AnswerDifficultyLabelKey;
  value: AnswerDifficulty;
}

type AnswerDifficultyLabelKey =
  | "train.answer-difficulty.options.easy"
  | "train.answer-difficulty.options.hard";

interface SelectedTrainSelectOption {
  label: string;
  value: string;
}

interface AnswerDifficultyDisplayOption {
  label: string;
  value: AnswerDifficulty;
}

const ANSWER_DIFFICULTY_OPTIONS = [
  {
    labelKey: "train.answer-difficulty.options.easy",
    value: "easy",
  },
  {
    labelKey: "train.answer-difficulty.options.hard",
    value: "hard",
  },
] satisfies readonly AnswerDifficultyOption[];

interface AnswerDifficultySelectProps {
  isDisabled: boolean;
  onSelectedAnswerDifficultyChange: (value: AnswerDifficulty) => void;
  selectedAnswerDifficulty: AnswerDifficulty;
}

export function AnswerDifficultySelect({
  isDisabled,
  onSelectedAnswerDifficultyChange,
  selectedAnswerDifficulty,
}: AnswerDifficultySelectProps) {
  const { t } = useTranslation();
  const answerDifficultyOptions = useMemo(
    () =>
      ANSWER_DIFFICULTY_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
  const selectedAnswerDifficultyOption = getSelectedAnswerDifficultyOption({
    answerDifficultyOptions,
    selectedAnswerDifficulty,
  });

  const handleValueChange = useCallback(
    (option: SelectedTrainSelectOption | undefined) => {
      if (!isAnswerDifficulty(option?.value)) {
        return;
      }

      onSelectedAnswerDifficultyChange(option.value);
    },
    [onSelectedAnswerDifficultyChange],
  );

  return (
    <Select
      isDisabled={isDisabled}
      value={selectedAnswerDifficultyOption}
      onValueChange={handleValueChange}
    >
      <Select.Trigger
        accessibilityLabel={t("train.answer-difficulty.select-label")}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={Gauge} size={20} />
        <Select.Value placeholder={t("train.answer-difficulty.placeholder")} />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger" className="px-0">
          <Select.ListLabel className="px-4 pb-2 pt-2">
            {t("train.answer-difficulty.select-label")}
          </Select.ListLabel>
          {answerDifficultyOptions.map((option) => (
            <HapticPressableFeedback key={option.value} asChild>
              <Select.Item
                value={option.value}
                label={option.label}
                className="px-4"
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <ThemedIcon icon={Gauge} size={18} />
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

interface GetSelectedAnswerDifficultyOptionParams {
  answerDifficultyOptions: readonly AnswerDifficultyDisplayOption[];
  selectedAnswerDifficulty: AnswerDifficulty;
}

function getSelectedAnswerDifficultyOption({
  answerDifficultyOptions,
  selectedAnswerDifficulty,
}: GetSelectedAnswerDifficultyOptionParams) {
  return answerDifficultyOptions.find(
    (option) => option.value === selectedAnswerDifficulty,
  );
}
