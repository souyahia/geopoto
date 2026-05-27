import { Select } from "heroui-native/select";
import { Check, ListChecks } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { HapticPressableFeedback } from "@/components/haptic-pressable-feedback";
import { ThemedIcon } from "@/services/theme/themed-icon";

import type { QuizzOptions } from "../utils/quizz";

interface SelectedTrainSelectOption {
  label: string;
  value: string;
}

export type QuestionLimitOptionValue = "no-limit" | "10" | "20" | "50" | "100";

interface QuestionLimitOption {
  labelKey: QuestionLimitLabelKey;
  limit: QuizzOptions["limit"];
  value: QuestionLimitOptionValue;
}

type QuestionLimitLabelKey =
  | "train.question-limit.options.no-limit"
  | "train.question-limit.options.10"
  | "train.question-limit.options.20"
  | "train.question-limit.options.50"
  | "train.question-limit.options.100";

const QUESTION_LIMIT_OPTIONS = [
  {
    labelKey: "train.question-limit.options.no-limit",
    limit: undefined,
    value: "no-limit",
  },
  {
    labelKey: "train.question-limit.options.10",
    limit: 10,
    value: "10",
  },
  {
    labelKey: "train.question-limit.options.20",
    limit: 20,
    value: "20",
  },
  {
    labelKey: "train.question-limit.options.50",
    limit: 50,
    value: "50",
  },
  {
    labelKey: "train.question-limit.options.100",
    limit: 100,
    value: "100",
  },
] satisfies readonly QuestionLimitOption[];

interface QuestionLimitSelectProps {
  onSelectedQuestionLimitChange: (value: QuestionLimitOptionValue) => void;
  selectedQuestionLimit: QuestionLimitOptionValue;
}

export function QuestionLimitSelect({
  onSelectedQuestionLimitChange,
  selectedQuestionLimit,
}: QuestionLimitSelectProps) {
  const { t } = useTranslation();
  const questionLimitOptions = useMemo(
    () =>
      QUESTION_LIMIT_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        limit: option.limit,
        value: option.value,
      })),
    [t],
  );
  const selectedQuestionLimitOption = getSelectedQuestionLimitOption({
    questionLimitOptions,
    selectedQuestionLimit,
  });

  const handleValueChange = useCallback(
    (option: SelectedTrainSelectOption | undefined) => {
      if (!isQuestionLimitOptionValue(option?.value)) {
        return;
      }

      onSelectedQuestionLimitChange(option.value);
    },
    [onSelectedQuestionLimitChange],
  );

  return (
    <Select
      value={selectedQuestionLimitOption}
      onValueChange={handleValueChange}
    >
      <Select.Trigger
        accessibilityLabel={t("train.question-limit.select-label")}
        className="bg-surface-tertiary"
      >
        <ThemedIcon icon={ListChecks} size={20} />
        <Select.Value placeholder={t("train.question-limit.placeholder")} />
        <Select.TriggerIndicator />
      </Select.Trigger>
      <Select.Portal>
        <Select.Overlay />
        <Select.Content presentation="popover" width="trigger" className="px-0">
          <Select.ListLabel className="px-4 pb-2 pt-2">
            {t("train.question-limit.select-label")}
          </Select.ListLabel>
          {questionLimitOptions.map((option) => (
            <HapticPressableFeedback key={option.value} asChild>
              <Select.Item
                value={option.value}
                label={option.label}
                className="px-4"
              >
                <View className="flex-1 flex-row items-center gap-3">
                  <ThemedIcon icon={ListChecks} size={18} />
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

interface QuestionLimitDisplayOption {
  label: string;
  limit: QuizzOptions["limit"];
  value: QuestionLimitOptionValue;
}

interface GetSelectedQuestionLimitOptionParams {
  questionLimitOptions: readonly QuestionLimitDisplayOption[];
  selectedQuestionLimit: QuestionLimitOptionValue;
}

function getSelectedQuestionLimitOption({
  questionLimitOptions,
  selectedQuestionLimit,
}: GetSelectedQuestionLimitOptionParams) {
  return questionLimitOptions.find(
    (option) => option.value === selectedQuestionLimit,
  );
}

function isQuestionLimitOptionValue(
  value: string | undefined,
): value is QuestionLimitOptionValue {
  switch (value) {
    case "no-limit":
    case "10":
    case "20":
    case "50":
    case "100":
      return true;
    case undefined:
      return false;
    default:
      return false;
  }
}
