import { useRouter } from "expo-router";
import type { TFunction } from "i18next";
import { Play } from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type Resolver,
  type ResolverResult,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import type { MapRegionName } from "@geopoto/geo-data";

import { HapticButton } from "@/components/haptic-button";
import { ThemedIcon } from "@/services/theme/themed-icon";

import { FlagAnswerDifficultySelect } from "../components/flag-answer-difficulty-select";
import {
  QuestionLimitSelect,
  type QuestionLimitOptionValue,
} from "../components/question-limit-select";
import {
  DEFAULT_QUIZZ_ANSWER_FORMATS,
  QuizzFormatSelect,
} from "../components/quizz-format-select";
import { RegionSelect } from "../components/region-select";
import { TrainHeader } from "../components/train-header";
import { TrainOptionSection } from "../components/train-option-section";
import { hasQuizzFormatConflict, type QuizzOptions } from "../utils/quizz";
import { useStoredTrainingSessionOptions } from "../utils/training-session-options-storage";
import { buildTrainingSessionSearchParams } from "../utils/training-session-params";

const TRAIN_FORMAT_ERROR_KEY = "train.validation.formats-must-be-different";
const TRAIN_FORM_DEFAULT_REGION: MapRegionName = "world";

interface TrainFormValues {
  acceptedAnswerFormats: QuizzOptions["acceptedAnswerFormats"];
  acceptedQuestionFormats: QuizzOptions["acceptedQuestionFormats"];
  flagAnswerDifficulty: QuizzOptions["flagAnswerDifficulty"];
  selectedQuestionLimit: QuestionLimitOptionValue;
  selectedRegion: MapRegionName;
}

export function TrainPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { saveStoredTrainingSessionOptions, storedTrainingSessionOptions } =
    useStoredTrainingSessionOptions();
  const defaultValues = useMemo(
    () =>
      getTrainFormValuesFromQuizzOptions({
        options: storedTrainingSessionOptions,
      }),
    [storedTrainingSessionOptions],
  );
  const { control, formState, handleSubmit, reset, trigger } =
    useForm<TrainFormValues>({
      defaultValues,
      mode: "onChange",
      resolver: trainFormResolver,
    });
  const acceptedQuestionFormats = useWatch({
    control,
    name: "acceptedQuestionFormats",
  });
  const acceptedAnswerFormats = useWatch({
    control,
    name: "acceptedAnswerFormats",
  });
  const hasFlagAnswerFormatSelected =
    acceptedAnswerFormats.includes("country-flag");

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    void trigger(["acceptedQuestionFormats", "acceptedAnswerFormats"]);
  }, [acceptedAnswerFormats, acceptedQuestionFormats, trigger]);

  const questionFormatErrorMessage = getTrainFormErrorMessage({
    message: formState.errors.acceptedQuestionFormats?.message,
    t,
  });
  const answerFormatErrorMessage = getTrainFormErrorMessage({
    message: formState.errors.acceptedAnswerFormats?.message,
    t,
  });
  const isStartDisabled = Boolean(
    questionFormatErrorMessage || answerFormatErrorMessage,
  );

  const submitTrainForm = useCallback(
    (values: TrainFormValues) => {
      const quizzOptions = getQuizzOptionsFromTrainFormValues({ values });
      saveStoredTrainingSessionOptions({ options: quizzOptions });

      const sessionSearchParams = buildTrainingSessionSearchParams({
        options: quizzOptions,
      });
      const searchParams = new URLSearchParams(sessionSearchParams);

      router.push(`/train/session?${searchParams.toString()}`);
    },
    [router, saveStoredTrainingSessionOptions],
  );

  const handleStartPress = useCallback(() => {
    void handleSubmit(submitTrainForm)();
  }, [handleSubmit, submitTrainForm]);

  return (
    <View className="flex-1 p-safe">
      <TrainHeader />
      <ScrollView className="flex-1">
        <View className="gap-4 px-6 pb-8 pt-4">
          <TrainOptionSection
            title={t("train.region.title")}
            description={t("train.region.description")}
          >
            <Controller
              control={control}
              name="selectedRegion"
              render={({ field }) => (
                <RegionSelect
                  selectedRegion={field.value}
                  onSelectedRegionChange={(selectedRegion) =>
                    field.onChange(selectedRegion)
                  }
                />
              )}
            />
          </TrainOptionSection>
          <TrainOptionSection
            title={t("train.question-formats.title")}
            description={t("train.question-formats.description")}
          >
            <Controller
              control={control}
              name="acceptedQuestionFormats"
              render={({ field }) => (
                <QuizzFormatSelect
                  accessibilityLabel={t("train.question-formats.trigger-label")}
                  errorMessage={questionFormatErrorMessage}
                  isInvalid={Boolean(questionFormatErrorMessage)}
                  label={t("train.question-formats.select-label")}
                  onSelectedFormatsChange={(acceptedQuestionFormats) =>
                    field.onChange(acceptedQuestionFormats)
                  }
                  selectedFormats={field.value}
                />
              )}
            />
          </TrainOptionSection>
          <TrainOptionSection
            title={t("train.answer-formats.title")}
            description={t("train.answer-formats.description")}
          >
            <Controller
              control={control}
              name="acceptedAnswerFormats"
              render={({ field }) => (
                <QuizzFormatSelect
                  accessibilityLabel={t("train.answer-formats.trigger-label")}
                  availableFormats={DEFAULT_QUIZZ_ANSWER_FORMATS}
                  errorMessage={answerFormatErrorMessage}
                  isInvalid={Boolean(answerFormatErrorMessage)}
                  label={t("train.answer-formats.select-label")}
                  onSelectedFormatsChange={(acceptedAnswerFormats) =>
                    field.onChange(acceptedAnswerFormats)
                  }
                  selectedFormats={field.value}
                />
              )}
            />
          </TrainOptionSection>
          <TrainOptionSection
            title={t("train.flag-answer-difficulty.title")}
            description={t("train.flag-answer-difficulty.description")}
          >
            <Controller
              control={control}
              name="flagAnswerDifficulty"
              render={({ field }) => (
                <FlagAnswerDifficultySelect
                  isDisabled={!hasFlagAnswerFormatSelected}
                  selectedFlagAnswerDifficulty={field.value}
                  onSelectedFlagAnswerDifficultyChange={(
                    flagAnswerDifficulty,
                  ) => field.onChange(flagAnswerDifficulty)}
                />
              )}
            />
          </TrainOptionSection>
          <TrainOptionSection
            title={t("train.question-limit.title")}
            description={t("train.question-limit.description")}
          >
            <Controller
              control={control}
              name="selectedQuestionLimit"
              render={({ field }) => (
                <QuestionLimitSelect
                  selectedQuestionLimit={field.value}
                  onSelectedQuestionLimitChange={(selectedQuestionLimit) =>
                    field.onChange(selectedQuestionLimit)
                  }
                />
              )}
            />
          </TrainOptionSection>
        </View>
      </ScrollView>
      <View className="px-6 pb-6 pt-3">
        <HapticButton
          accessibilityLabel={t("train.start")}
          className="w-full"
          isDisabled={isStartDisabled}
          onPress={handleStartPress}
          variant="primary"
        >
          <ThemedIcon
            colorClassName="text-accent-foreground"
            icon={Play}
            size={18}
          />
          <HapticButton.Label>{t("train.start")}</HapticButton.Label>
        </HapticButton>
      </View>
    </View>
  );
}

const trainFormResolver: Resolver<TrainFormValues> = (
  values,
): ResolverResult<TrainFormValues> => {
  if (!hasQuizzFormatConflict(values)) {
    return {
      errors: {},
      values,
    };
  }

  return {
    errors: {
      acceptedAnswerFormats: {
        message: TRAIN_FORMAT_ERROR_KEY,
        type: "validate",
      },
      acceptedQuestionFormats: {
        message: TRAIN_FORMAT_ERROR_KEY,
        type: "validate",
      },
    },
    values: {},
  };
};

interface GetTrainFormValuesFromQuizzOptionsParams {
  options: QuizzOptions;
}

function getTrainFormValuesFromQuizzOptions({
  options,
}: GetTrainFormValuesFromQuizzOptionsParams): TrainFormValues {
  return {
    acceptedAnswerFormats: options.acceptedAnswerFormats,
    acceptedQuestionFormats: options.acceptedQuestionFormats,
    flagAnswerDifficulty: options.flagAnswerDifficulty,
    selectedQuestionLimit: getSelectedQuestionLimit({
      limit: options.limit,
    }),
    selectedRegion: options.regions.at(0) ?? TRAIN_FORM_DEFAULT_REGION,
  };
}

interface GetQuizzOptionsFromTrainFormValuesParams {
  values: TrainFormValues;
}

function getQuizzOptionsFromTrainFormValues({
  values,
}: GetQuizzOptionsFromTrainFormValuesParams): QuizzOptions {
  return {
    acceptedAnswerFormats: values.acceptedAnswerFormats,
    acceptedQuestionFormats: values.acceptedQuestionFormats,
    flagAnswerDifficulty: values.flagAnswerDifficulty,
    limit: getQuestionLimit(values.selectedQuestionLimit),
    regions: [values.selectedRegion],
  };
}

interface GetTrainFormErrorMessageParams {
  message: string | undefined;
  t: TFunction;
}

function getTrainFormErrorMessage({
  message,
  t,
}: GetTrainFormErrorMessageParams) {
  switch (message) {
    case TRAIN_FORMAT_ERROR_KEY:
      return t(TRAIN_FORMAT_ERROR_KEY);
    case undefined:
      return undefined;
    default:
      return message;
  }
}

function getQuestionLimit(
  selectedQuestionLimit: QuestionLimitOptionValue,
): number | undefined {
  switch (selectedQuestionLimit) {
    case "no-limit":
      return undefined;
    case "10":
    case "20":
    case "50":
    case "100":
      return Number(selectedQuestionLimit);
    default: {
      const exhaustiveQuestionLimit: never = selectedQuestionLimit;

      return exhaustiveQuestionLimit;
    }
  }
}

interface GetSelectedQuestionLimitParams {
  limit: QuizzOptions["limit"];
}

function getSelectedQuestionLimit({
  limit,
}: GetSelectedQuestionLimitParams): QuestionLimitOptionValue {
  switch (limit) {
    case 10:
      return "10";
    case 20:
      return "20";
    case 50:
      return "50";
    case 100:
      return "100";
    case undefined:
      return "no-limit";
    default:
      return "no-limit";
  }
}
