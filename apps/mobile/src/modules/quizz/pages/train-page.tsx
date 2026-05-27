import type { TFunction } from "i18next";
import { Play } from "lucide-react-native";
import { useCallback, useEffect } from "react";
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

import {
  QuestionLimitSelect,
  type QuestionLimitOptionValue,
} from "../components/question-limit-select";
import {
  DEFAULT_QUIZZ_FORMATS,
  QuizzFormatSelect,
} from "../components/quizz-format-select";
import { RegionSelect } from "../components/region-select";
import { TrainHeader } from "../components/train-header";
import { TrainOptionSection } from "../components/train-option-section";
import type { QuizzFormat, QuizzOptions } from "../utils/quizz";

const TRAIN_FORMAT_ERROR_KEY = "train.validation.formats-must-be-different";

interface TrainFormValues {
  acceptedAnswerFormats: QuizzOptions["acceptedAnswerFormats"];
  acceptedQuestionFormats: QuizzOptions["acceptedQuestionFormats"];
  selectedQuestionLimit: QuestionLimitOptionValue;
  selectedRegion: MapRegionName;
}

const TRAIN_FORM_DEFAULT_VALUES = {
  acceptedAnswerFormats: DEFAULT_QUIZZ_FORMATS,
  acceptedQuestionFormats: DEFAULT_QUIZZ_FORMATS,
  selectedQuestionLimit: "no-limit",
  selectedRegion: "world",
} satisfies TrainFormValues;

export function TrainPage() {
  const { t } = useTranslation();
  const { control, formState, handleSubmit, trigger } =
    useForm<TrainFormValues>({
      defaultValues: TRAIN_FORM_DEFAULT_VALUES,
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

  const submitTrainForm = useCallback(() => undefined, []);

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
  if (!hasTrainFormFormatConflict(values)) {
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

interface HasTrainFormFormatConflictParams {
  acceptedAnswerFormats: QuizzFormat[];
  acceptedQuestionFormats: QuizzFormat[];
}

function hasTrainFormFormatConflict({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
}: HasTrainFormFormatConflictParams) {
  const firstQuestionFormat = acceptedQuestionFormats.at(0);
  const firstAnswerFormat = acceptedAnswerFormats.at(0);

  return (
    acceptedQuestionFormats.length === 1 &&
    acceptedAnswerFormats.length === 1 &&
    firstQuestionFormat === firstAnswerFormat
  );
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
