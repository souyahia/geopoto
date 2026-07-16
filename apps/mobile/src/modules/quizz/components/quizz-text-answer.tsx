import { Input } from "heroui-native/input";
import { Text } from "heroui-native/text";
import type { TFunction } from "i18next";
import { ArrowRight, Check, Globe, Landmark } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, View } from "react-native";

import {
  COUNTRIES,
  isCountryDisabled,
  type Country,
  type MapRegionName,
  type SupportedGeoLanguage,
} from "@geopoto/geo-data";

import { HapticButton } from "@/components/haptic-button";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";
import { shuffle } from "@/utils/random";

import {
  normalizeQuizzTextAnswer,
  type QuizzAnswerSubmission,
} from "../hooks/use-quizz";
import type { AnswerDifficulty, QuizzFormat } from "../utils/quizz";

type TextAnswerFormat = Extract<
  QuizzFormat,
  "country-capital" | "country-name"
>;

const EASY_TEXT_ANSWER_OPTION_COUNT = 4;

interface TextAnswerContentProps {
  answerFormat: TextAnswerFormat;
  answerRegions: readonly MapRegionName[];
  correctAnswer: string;
  country: Country;
  isDisabled: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onNextQuestionPress: () => void;
  shouldShowCorrectAnswer: boolean;
}

interface QuizzTextAnswerProps extends TextAnswerContentProps {
  answerDifficulty: AnswerDifficulty;
}

export function QuizzTextAnswer({
  answerDifficulty,
  answerFormat,
  answerRegions,
  correctAnswer,
  country,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: QuizzTextAnswerProps) {
  const textAnswerProps = {
    answerFormat,
    answerRegions,
    correctAnswer,
    country,
    isDisabled,
    onAnswerSubmit,
    onNextQuestionPress,
    shouldShowCorrectAnswer,
  } satisfies TextAnswerContentProps;

  switch (answerDifficulty) {
    case "easy":
      return <EasyTextAnswer {...textAnswerProps} />;
    case "hard":
      return <HardTextAnswer {...textAnswerProps} />;
    default: {
      const exhaustiveAnswerDifficulty: never = answerDifficulty;

      return exhaustiveAnswerDifficulty;
    }
  }
}

function HardTextAnswer({
  answerFormat,
  correctAnswer,
  country,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: TextAnswerContentProps) {
  const { t } = useTranslation();
  const [answerValue, setAnswerValue] = useState("");
  const [badgeWidth, setBadgeWidth] = useState(0);
  const { icon: BadgeIcon, label: badgeLabel } = getTextAnswerBadge({
    answerFormat,
    t,
  });
  const isEmptyAnswer = normalizeQuizzTextAnswer(answerValue).length === 0;
  const isSubmitDisabled =
    !shouldShowCorrectAnswer && (isDisabled || isEmptyAnswer);
  const answerInputLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.correct-answer-label")
    : getTextAnswerInputLabel({ answerFormat, t });
  const answerInputLabelClassName = shouldShowCorrectAnswer
    ? "text-success"
    : undefined;
  const answerInputClassName = shouldShowCorrectAnswer
    ? "border-success bg-success/10"
    : undefined;
  const isTextInputDisabled = isDisabled && !shouldShowCorrectAnswer;
  const isTextInputEditable = !isDisabled;
  const shouldAutoFocusInput = isTextInputEditable && !shouldShowCorrectAnswer;
  const submitButtonLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.next")
    : t("train.session.answer.submit");
  const SubmitButtonIcon = shouldShowCorrectAnswer ? ArrowRight : Check;

  useEffect(() => {
    if (shouldShowCorrectAnswer) {
      setAnswerValue(correctAnswer);
      return;
    }

    setAnswerValue("");
  }, [answerFormat, correctAnswer, country.code, shouldShowCorrectAnswer]);

  const handleSubmit = useCallback(() => {
    if (isSubmitDisabled) {
      return;
    }

    onAnswerSubmit({
      type: "text",
      value: answerValue,
    });
  }, [answerValue, isSubmitDisabled, onAnswerSubmit]);
  const handleButtonPress = shouldShowCorrectAnswer
    ? onNextQuestionPress
    : handleSubmit;
  const handleBadgeLayout = useCallback((event: LayoutChangeEvent) => {
    setBadgeWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View className="gap-3">
      <Text
        className={answerInputLabelClassName}
        type="body-sm"
        weight="semibold"
      >
        {answerInputLabel}
      </Text>
      <View className="relative justify-center">
        <View
          className="absolute left-2 z-10 flex-row items-center gap-1.5 rounded-md border border-default bg-surface-tertiary px-2 py-1"
          onLayout={handleBadgeLayout}
          pointerEvents="none"
        >
          <ThemedIcon colorClassName="text-muted" icon={BadgeIcon} size={13} />
          <Text color="muted" type="body-xs" weight="semibold">
            {badgeLabel}
          </Text>
        </View>
        <Input
          accessibilityLabel={t("train.session.answer.text-input-label")}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={shouldAutoFocusInput}
          className={answerInputClassName}
          editable={isTextInputEditable}
          isDisabled={isTextInputDisabled}
          onChangeText={setAnswerValue}
          onSubmitEditing={shouldShowCorrectAnswer ? undefined : handleSubmit}
          placeholder={t("train.session.answer.text-input-placeholder")}
          returnKeyType="done"
          spellCheck={false}
          style={{ paddingLeft: badgeWidth + 16 }}
          value={answerValue}
        />
      </View>
      <HapticButton
        isDisabled={isSubmitDisabled}
        onPress={handleButtonPress}
        variant="primary"
      >
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={SubmitButtonIcon}
          size={18}
        />
        <HapticButton.Label>{submitButtonLabel}</HapticButton.Label>
      </HapticButton>
    </View>
  );
}

function EasyTextAnswer({
  answerFormat,
  answerRegions,
  correctAnswer,
  country,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: TextAnswerContentProps) {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const options = useMemo(
    () =>
      getEasyTextAnswerOptions({
        answerFormat,
        answerRegions,
        country,
        geoLang,
      }),
    [answerFormat, answerRegions, country, geoLang],
  );
  const hasSelectedValue = selectedValue !== null;
  const isAnswerButtonDisabled =
    !shouldShowCorrectAnswer && (isDisabled || !hasSelectedValue);
  const answerLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.correct-answer-label")
    : getEasyTextAnswerLabel({ answerFormat, t });
  const answerLabelClassName = shouldShowCorrectAnswer
    ? "text-success"
    : undefined;
  const answerButtonLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.next")
    : t("train.session.answer.confirm");
  const AnswerButtonIcon = shouldShowCorrectAnswer ? ArrowRight : Check;
  const correctNormalizedValue = normalizeQuizzTextAnswer(correctAnswer);

  useEffect(() => {
    if (shouldShowCorrectAnswer) {
      setSelectedValue(correctAnswer);
      return;
    }

    setSelectedValue(null);
  }, [correctAnswer, country.code, shouldShowCorrectAnswer]);

  const handleSelect = useCallback((value: string) => {
    setSelectedValue(value);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedValue === null) {
      return;
    }

    onAnswerSubmit({
      type: "text",
      value: selectedValue,
    });
  }, [onAnswerSubmit, selectedValue]);
  const handleButtonPress = shouldShowCorrectAnswer
    ? onNextQuestionPress
    : handleConfirm;

  return (
    <View className="gap-3">
      <Text className={answerLabelClassName} type="body-sm" weight="semibold">
        {answerLabel}
      </Text>
      <View className="gap-1.5">
        {options.map((option) => {
          const isSelected = option === selectedValue;
          const isCorrectOption =
            normalizeQuizzTextAnswer(option) === correctNormalizedValue;

          return (
            <EasyTextAnswerOption
              isDisabled={isDisabled}
              isSelected={isSelected}
              key={option}
              onSelect={handleSelect}
              shouldUseSuccessStyle={shouldShowCorrectAnswer && isCorrectOption}
              value={option}
            />
          );
        })}
      </View>
      <HapticButton
        isDisabled={isAnswerButtonDisabled}
        onPress={handleButtonPress}
        variant="primary"
      >
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={AnswerButtonIcon}
          size={18}
        />
        <HapticButton.Label>{answerButtonLabel}</HapticButton.Label>
      </HapticButton>
    </View>
  );
}

interface EasyTextAnswerOptionProps {
  isDisabled: boolean;
  isSelected: boolean;
  onSelect: (value: string) => void;
  shouldUseSuccessStyle: boolean;
  value: string;
}

function EasyTextAnswerOption({
  isDisabled,
  isSelected,
  onSelect,
  shouldUseSuccessStyle,
  value,
}: EasyTextAnswerOptionProps) {
  const { t } = useTranslation();
  const content = (
    <View
      className={[
        "min-h-11 justify-center rounded-xl border bg-field px-4 py-2.5",
        getEasyTextAnswerOptionClassName({ isSelected, shouldUseSuccessStyle }),
      ].join(" ")}
    >
      <Text type="body-sm" weight="medium" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
  const handlePress = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  if (isDisabled) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={t("train.session.answer.text-option-label", {
        value,
      })}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={handlePress}
    >
      {content}
    </Pressable>
  );
}

interface GetEasyTextAnswerOptionClassNameParams {
  isSelected: boolean;
  shouldUseSuccessStyle: boolean;
}

function getEasyTextAnswerOptionClassName({
  isSelected,
  shouldUseSuccessStyle,
}: GetEasyTextAnswerOptionClassNameParams) {
  if (shouldUseSuccessStyle) {
    return "border-success bg-success/10";
  }

  if (isSelected) {
    return "border-2 border-accent bg-accent/10";
  }

  return "border-border";
}

interface GetEasyTextAnswerOptionsParams {
  answerFormat: TextAnswerFormat;
  answerRegions: readonly MapRegionName[];
  country: Country;
  geoLang: SupportedGeoLanguage;
}

function getEasyTextAnswerOptions({
  answerFormat,
  answerRegions,
  country,
  geoLang,
}: GetEasyTextAnswerOptionsParams): readonly string[] {
  const correctValue = getTextAnswerValue({ answerFormat, country, geoLang });
  const distractorValues = getEasyTextDistractorValues({
    answerFormat,
    answerRegions,
    correctValue,
    country,
    geoLang,
  });

  return shuffle([correctValue, ...distractorValues]);
}

interface GetEasyTextDistractorValuesParams {
  answerFormat: TextAnswerFormat;
  answerRegions: readonly MapRegionName[];
  correctValue: string;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

function getEasyTextDistractorValues({
  answerFormat,
  answerRegions,
  correctValue,
  country,
  geoLang,
}: GetEasyTextDistractorValuesParams): readonly string[] {
  const distractorCount = EASY_TEXT_ANSWER_OPTION_COUNT - 1;
  const correctNormalizedValue = normalizeQuizzTextAnswer(correctValue);
  const otherCountries = COUNTRIES.filter(
    (candidateCountry) =>
      !isCountryDisabled(candidateCountry.code) &&
      candidateCountry.code !== country.code,
  );
  const regionCountries = otherCountries.filter((candidateCountry) =>
    answerRegions.some((region) => candidateCountry.regions.includes(region)),
  );
  const fallbackCountries = otherCountries.filter(
    (candidateCountry) =>
      !answerRegions.some((region) =>
        candidateCountry.regions.includes(region),
      ),
  );
  const orderedCandidates = [
    ...shuffle(regionCountries),
    ...shuffle(fallbackCountries),
  ];

  return orderedCandidates.reduce<string[]>((distractors, candidateCountry) => {
    if (distractors.length >= distractorCount) {
      return distractors;
    }

    const value = getTextAnswerValue({
      answerFormat,
      country: candidateCountry,
      geoLang,
    });
    const normalizedValue = normalizeQuizzTextAnswer(value);
    const isDuplicate =
      normalizedValue === correctNormalizedValue ||
      distractors.some(
        (distractor) =>
          normalizeQuizzTextAnswer(distractor) === normalizedValue,
      );

    if (isDuplicate) {
      return distractors;
    }

    return [...distractors, value];
  }, []);
}

interface GetTextAnswerValueParams {
  answerFormat: TextAnswerFormat;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

function getTextAnswerValue({
  answerFormat,
  country,
  geoLang,
}: GetTextAnswerValueParams): string {
  switch (answerFormat) {
    case "country-name":
      return country.name[geoLang];
    case "country-capital":
      return country.capital[geoLang];
    default: {
      const exhaustiveAnswerFormat: never = answerFormat;

      return exhaustiveAnswerFormat;
    }
  }
}

interface GetEasyTextAnswerLabelParams {
  answerFormat: TextAnswerFormat;
  t: TFunction;
}

function getEasyTextAnswerLabel({
  answerFormat,
  t,
}: GetEasyTextAnswerLabelParams) {
  switch (answerFormat) {
    case "country-name":
      return t("train.session.answer.country-name-choose-label");
    case "country-capital":
      return t("train.session.answer.country-capital-choose-label");
    default: {
      const exhaustiveAnswerFormat: never = answerFormat;

      return exhaustiveAnswerFormat;
    }
  }
}

interface GetTextAnswerInputLabelParams {
  answerFormat: TextAnswerFormat;
  t: TFunction;
}

function getTextAnswerInputLabel({
  answerFormat,
  t,
}: GetTextAnswerInputLabelParams) {
  switch (answerFormat) {
    case "country-name":
      return t("train.session.answer.country-name-label");
    case "country-capital":
      return t("train.session.answer.country-capital-label");
    default: {
      const exhaustiveAnswerFormat: never = answerFormat;

      return exhaustiveAnswerFormat;
    }
  }
}

interface GetTextAnswerBadgeParams {
  answerFormat: TextAnswerFormat;
  t: TFunction;
}

function getTextAnswerBadge({ answerFormat, t }: GetTextAnswerBadgeParams) {
  switch (answerFormat) {
    case "country-name":
      return {
        icon: Globe,
        label: t("train.session.answer.country-name-badge"),
      };
    case "country-capital":
      return {
        icon: Landmark,
        label: t("train.session.answer.country-capital-badge"),
      };
    default: {
      const exhaustiveAnswerFormat: never = answerFormat;

      return exhaustiveAnswerFormat;
    }
  }
}
