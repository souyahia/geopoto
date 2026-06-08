import { Input } from "heroui-native/input";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import type { TFunction } from "i18next";
import { ArrowRight, Check, CheckCircle2, CircleX } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";

import type {
  Country,
  MapRegionName,
  SupportedGeoLanguage,
} from "@geopoto/geo-data";
import { getCountryFlag } from "@geopoto/geo-data/flags";

import { CountryFlag } from "@/components/country-flag";
import { HapticButton } from "@/components/haptic-button";
import { MapViewer } from "@/modules/map-viewer/components/map-viewer";
import type {
  MapViewerCenterTarget,
  MapViewerHighlight,
  MapViewerHighlightTarget,
} from "@/modules/map-viewer/utils/map-viewer-viewport";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import {
  normalizeQuizzTextAnswer,
  type QuizzAnswerSubmission,
} from "../hooks/use-quizz";
import type { FlagAnswerDifficulty, QuizzFormat } from "../utils/quizz";
import { QuizzFlagAnswer } from "./quizz-flag-answer";

const EMPTY_QUIZZ_QUESTION_HIGHLIGHTS: readonly MapViewerHighlight[] = [];
const QUIZZ_QUESTION_MAP_CLASS_NAME = "h-[202px]";
const QUIZZ_ANSWER_MAP_CLASS_NAME = "h-56";
const QUESTION_FLAG_FALLBACK_ASPECT_RATIO = 3 / 2;
const QUESTION_FLAG_HORIZONTAL_PADDING = 96;
const QUESTION_FLAG_MAX_HEIGHT = 154;
const QUESTION_FLAG_MAX_WIDTH = 252;
const ANSWER_FEEDBACK_DURATION_MS = 300;

type QuizzAnswerFeedback =
  | {
      status: "idle";
    }
  | {
      answer: QuizzAnswerSubmission;
      status: "correct-feedback";
    }
  | {
      answer: QuizzAnswerSubmission;
      status: "wrong-feedback";
    }
  | {
      answer: QuizzAnswerSubmission;
      status: "wrong-review";
    };

interface QuizzQuestionCardProps {
  answerFormat: QuizzFormat;
  answerRegion: MapRegionName;
  country: Country;
  flagAnswerDifficulty: FlagAnswerDifficulty;
  onAnswerResolved?: (resolution: QuizzAnswerResolution) => void;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  questionFormat: QuizzFormat;
}

export interface QuizzAnswerResolution {
  answer: QuizzAnswerSubmission;
  isCorrectAnswer: boolean;
}

export function QuizzQuestionCard({
  answerFormat,
  answerRegion,
  country,
  flagAnswerDifficulty,
  onAnswerResolved,
  onAnswerSubmit,
  questionFormat,
}: QuizzQuestionCardProps) {
  const { geoLang } = useGeoLangStore();
  const countryName = country.name[geoLang];
  const capitalName = country.capital[geoLang];
  const answerFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasResolvedAnswerRef = useRef(false);
  const [answerFeedback, setAnswerFeedback] = useState<QuizzAnswerFeedback>({
    status: "idle",
  });
  const questionSurfaceClassName = getQuestionSurfaceClassName({
    questionFormat,
  });
  const isAnswerLocked = answerFeedback.status !== "idle";
  const shouldShowCorrectAnswer = answerFeedback.status === "wrong-review";
  const shouldShowCorrectOverlay = answerFeedback.status === "correct-feedback";
  const shouldShowWrongOverlay = answerFeedback.status === "wrong-feedback";

  const clearAnswerFeedbackTimeout = useCallback(() => {
    if (answerFeedbackTimeoutRef.current === null) {
      return;
    }

    clearTimeout(answerFeedbackTimeoutRef.current);
    answerFeedbackTimeoutRef.current = null;
  }, []);

  useEffect(() => clearAnswerFeedbackTimeout, [clearAnswerFeedbackTimeout]);

  useEffect(() => {
    clearAnswerFeedbackTimeout();
    hasResolvedAnswerRef.current = false;
    setAnswerFeedback({ status: "idle" });
  }, [answerFormat, clearAnswerFeedbackTimeout, country.code, questionFormat]);

  const handleAnswerSubmit = useCallback(
    (answer: QuizzAnswerSubmission) => {
      if (isAnswerLocked || hasResolvedAnswerRef.current) {
        return;
      }

      hasResolvedAnswerRef.current = true;

      const isCorrectAnswer = isQuizzAnswerSubmissionCorrect({
        answer,
        answerFormat,
        country,
        geoLang,
      });

      onAnswerResolved?.({ answer, isCorrectAnswer });

      if (isCorrectAnswer) {
        setAnswerFeedback({
          answer,
          status: "correct-feedback",
        });
        answerFeedbackTimeoutRef.current = setTimeout(() => {
          answerFeedbackTimeoutRef.current = null;
          onAnswerSubmit(answer);
        }, ANSWER_FEEDBACK_DURATION_MS);
        return;
      }

      setAnswerFeedback({
        answer,
        status: "wrong-feedback",
      });
      answerFeedbackTimeoutRef.current = setTimeout(() => {
        answerFeedbackTimeoutRef.current = null;
        setAnswerFeedback({
          answer,
          status: "wrong-review",
        });
      }, ANSWER_FEEDBACK_DURATION_MS);
    },
    [
      answerFormat,
      country,
      geoLang,
      isAnswerLocked,
      onAnswerResolved,
      onAnswerSubmit,
    ],
  );

  const handleNextQuestionPress = useCallback(() => {
    if (answerFeedback.status !== "wrong-review") {
      return;
    }

    onAnswerSubmit(answerFeedback.answer);
  }, [answerFeedback, onAnswerSubmit]);

  return (
    <View className="relative gap-5">
      <QuizzQuestionFeedbackOverlay
        shouldShowCorrectOverlay={shouldShowCorrectOverlay}
        shouldShowWrongOverlay={shouldShowWrongOverlay}
      />
      <Surface variant="secondary" className={questionSurfaceClassName}>
        <QuizzQuestionPrompt
          capitalName={capitalName}
          country={country}
          countryName={countryName}
          questionFormat={questionFormat}
        />
      </Surface>
      <Surface variant="secondary" className="gap-4">
        <QuizzQuestionAnswer
          answerFormat={answerFormat}
          answerRegion={answerRegion}
          capitalName={capitalName}
          countryCode={country.code}
          country={country}
          countryName={countryName}
          flagAnswerDifficulty={flagAnswerDifficulty}
          isDisabled={isAnswerLocked}
          onAnswerSubmit={handleAnswerSubmit}
          onNextQuestionPress={handleNextQuestionPress}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
      </Surface>
    </View>
  );
}

interface QuizzQuestionFeedbackOverlayProps {
  shouldShowCorrectOverlay: boolean;
  shouldShowWrongOverlay: boolean;
}

function QuizzQuestionFeedbackOverlay({
  shouldShowCorrectOverlay,
  shouldShowWrongOverlay,
}: QuizzQuestionFeedbackOverlayProps) {
  if (!shouldShowCorrectOverlay && !shouldShowWrongOverlay) {
    return null;
  }

  const icon = shouldShowCorrectOverlay ? CheckCircle2 : CircleX;
  const colorClassName = shouldShowCorrectOverlay
    ? "text-success"
    : "text-danger";

  return (
    <View
      className="absolute inset-0 z-20 items-center justify-center bg-background/40"
      pointerEvents="none"
    >
      <View className="h-28 w-28 items-center justify-center rounded-full border border-default bg-surface shadow-lg">
        <ThemedIcon
          colorClassName={colorClassName}
          icon={icon}
          size={64}
          strokeWidth={2.5}
        />
      </View>
    </View>
  );
}

interface GetQuestionSurfaceClassNameParams {
  questionFormat: QuizzFormat;
}

function getQuestionSurfaceClassName({
  questionFormat,
}: GetQuestionSurfaceClassNameParams) {
  switch (questionFormat) {
    case "country-name":
    case "country-capital":
      return "justify-center gap-4 py-6";
    case "country-position":
      return "min-h-64 justify-center gap-4";
    case "country-flag":
      return "justify-center gap-4 py-2";
    default: {
      const exhaustiveFormat: never = questionFormat;

      return exhaustiveFormat;
    }
  }
}

interface QuizzQuestionPromptProps {
  capitalName: string;
  country: Country;
  countryName: string;
  questionFormat: QuizzFormat;
}

function QuizzQuestionPrompt({
  capitalName,
  country,
  countryName,
  questionFormat,
}: QuizzQuestionPromptProps) {
  const { t } = useTranslation();

  switch (questionFormat) {
    case "country-name":
      return (
        <TextQuestion
          label={t("train.session.question.country-label")}
          value={countryName}
        />
      );
    case "country-capital":
      return (
        <TextQuestion
          label={t("train.session.question.capital-label")}
          value={capitalName}
        />
      );
    case "country-flag":
      return <FlagQuestion country={country} />;
    case "country-position":
      return <CountryPositionQuestion country={country} />;
    default: {
      const exhaustiveFormat: never = questionFormat;

      return exhaustiveFormat;
    }
  }
}

interface TextQuestionProps {
  label: string;
  value: string;
}

function TextQuestion({ label, value }: TextQuestionProps) {
  return (
    <View className="items-center gap-1">
      <Text type="body-sm" color="muted" align="center" weight="semibold">
        {label}
      </Text>
      <Text type="h2" align="center">
        {value}
      </Text>
    </View>
  );
}

interface FlagQuestionProps {
  country: Country;
}

function FlagQuestion({ country }: FlagQuestionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const flag = getCountryFlag(country.code);
  const flagSize = getQuestionFlagSize({
    aspectRatio: flag?.aspectRatio ?? QUESTION_FLAG_FALLBACK_ASPECT_RATIO,
    maxHeight: QUESTION_FLAG_MAX_HEIGHT,
    maxWidth: Math.min(
      QUESTION_FLAG_MAX_WIDTH,
      Math.max(windowWidth - QUESTION_FLAG_HORIZONTAL_PADDING, 160),
    ),
  });

  return (
    <View className="items-center justify-center">
      <CountryFlag
        code={country.code}
        height={flagSize.height}
        width={flagSize.width}
        className="border border-default"
      />
    </View>
  );
}

interface GetQuestionFlagSizeParams {
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
}

function getQuestionFlagSize({
  aspectRatio,
  maxHeight,
  maxWidth,
}: GetQuestionFlagSizeParams) {
  const heightFromMaxWidth = maxWidth / aspectRatio;

  if (heightFromMaxWidth <= maxHeight) {
    return {
      height: heightFromMaxWidth,
      width: maxWidth,
    };
  }

  return {
    height: maxHeight,
    width: maxHeight * aspectRatio,
  };
}

interface CountryPositionQuestionProps {
  country: Country;
}

function CountryPositionQuestion({ country }: CountryPositionQuestionProps) {
  const target = useMemo<MapViewerHighlightTarget>(
    () => ({
      country,
      type: "country",
    }),
    [country],
  );
  const highlights = useMemo<readonly MapViewerHighlight[]>(
    () => [{ target }],
    [target],
  );

  return (
    <MapViewer
      centersOn={target}
      className={QUIZZ_QUESTION_MAP_CLASS_NAME}
      highlights={highlights}
      isInteractive
    />
  );
}

interface QuizzQuestionAnswerProps {
  answerFormat: QuizzFormat;
  answerRegion: MapRegionName;
  capitalName: string;
  country: Country;
  countryCode: string;
  countryName: string;
  flagAnswerDifficulty: FlagAnswerDifficulty;
  isDisabled: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onNextQuestionPress: () => void;
  shouldShowCorrectAnswer: boolean;
}

function QuizzQuestionAnswer({
  answerFormat,
  answerRegion,
  capitalName,
  country,
  countryCode,
  countryName,
  flagAnswerDifficulty,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: QuizzQuestionAnswerProps) {
  switch (answerFormat) {
    case "country-name":
      return (
        <TextAnswer
          answerFormat={answerFormat}
          correctAnswer={countryName}
          countryCode={countryCode}
          isDisabled={isDisabled}
          onAnswerSubmit={onAnswerSubmit}
          onNextQuestionPress={onNextQuestionPress}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
      );
    case "country-capital":
      return (
        <TextAnswer
          answerFormat={answerFormat}
          correctAnswer={capitalName}
          countryCode={countryCode}
          isDisabled={isDisabled}
          onAnswerSubmit={onAnswerSubmit}
          onNextQuestionPress={onNextQuestionPress}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
      );
    case "country-flag":
      return (
        <QuizzFlagAnswer
          country={country}
          countryName={countryName}
          flagAnswerDifficulty={flagAnswerDifficulty}
          isDisabled={isDisabled}
          key={country.code}
          onAnswerSubmit={onAnswerSubmit}
          onNextQuestionPress={onNextQuestionPress}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
      );
    case "country-position":
      return (
        <CountrySelectionAnswer
          answerRegion={answerRegion}
          country={country}
          countryCode={countryCode}
          countryName={countryName}
          isDisabled={isDisabled}
          onAnswerSubmit={onAnswerSubmit}
          onNextQuestionPress={onNextQuestionPress}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
      );
    default: {
      const exhaustiveFormat: never = answerFormat;

      return exhaustiveFormat;
    }
  }
}

interface TextAnswerProps {
  answerFormat: Extract<QuizzFormat, "country-capital" | "country-name">;
  correctAnswer: string;
  countryCode: string;
  isDisabled: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onNextQuestionPress: () => void;
  shouldShowCorrectAnswer: boolean;
}

function TextAnswer({
  answerFormat,
  correctAnswer,
  countryCode,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: TextAnswerProps) {
  const { t } = useTranslation();
  const [answerValue, setAnswerValue] = useState("");
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
  }, [answerFormat, correctAnswer, countryCode, shouldShowCorrectAnswer]);

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

  return (
    <View className="gap-3">
      <Text
        className={answerInputLabelClassName}
        type="body-sm"
        weight="semibold"
      >
        {answerInputLabel}
      </Text>
      <Input
        accessibilityLabel={t("train.session.answer.text-input-label")}
        autoCapitalize="none"
        autoCorrect={false}
        className={answerInputClassName}
        editable={isTextInputEditable}
        isDisabled={isTextInputDisabled}
        onChangeText={setAnswerValue}
        onSubmitEditing={shouldShowCorrectAnswer ? undefined : handleSubmit}
        placeholder={t("train.session.answer.text-input-placeholder")}
        returnKeyType="done"
        spellCheck={false}
        value={answerValue}
      />
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

interface GetTextAnswerInputLabelParams {
  answerFormat: Extract<QuizzFormat, "country-capital" | "country-name">;
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

interface CountrySelectionAnswerProps {
  answerRegion: MapRegionName;
  country: Country;
  countryCode: string;
  countryName: string;
  isDisabled: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onNextQuestionPress: () => void;
  shouldShowCorrectAnswer: boolean;
}

function CountrySelectionAnswer({
  answerRegion,
  country,
  countryCode,
  countryName,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: CountrySelectionAnswerProps) {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const highlightedCountry = shouldShowCorrectAnswer
    ? country
    : selectedCountry;
  const activeTargets = useMemo<readonly MapViewerHighlightTarget[]>(
    () => [
      {
        region: answerRegion,
        type: "region",
      },
    ],
    [answerRegion],
  );
  const centerTarget = useMemo<MapViewerCenterTarget>(() => {
    if (shouldShowCorrectAnswer) {
      return {
        country,
        type: "country",
      };
    }

    return {
      region: answerRegion,
      type: "region",
    };
  }, [answerRegion, country, shouldShowCorrectAnswer]);
  const highlights = useMemo<readonly MapViewerHighlight[]>(() => {
    if (highlightedCountry === null) {
      return EMPTY_QUIZZ_QUESTION_HIGHLIGHTS;
    }

    return [
      {
        target: {
          country: highlightedCountry,
          type: "country",
        },
      },
    ];
  }, [highlightedCountry]);
  const isConfirmDisabled = selectedCountry === null;
  const isAnswerButtonDisabled =
    !shouldShowCorrectAnswer && (isDisabled || isConfirmDisabled);
  const answerButtonLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.next")
    : t("train.session.answer.confirm");
  const AnswerButtonIcon = shouldShowCorrectAnswer ? ArrowRight : Check;
  const answerMapClassName = shouldShowCorrectAnswer
    ? `${QUIZZ_ANSWER_MAP_CLASS_NAME} border-success`
    : QUIZZ_ANSWER_MAP_CLASS_NAME;

  useEffect(() => {
    if (shouldShowCorrectAnswer) {
      return;
    }

    setSelectedCountry(null);
  }, [countryCode, shouldShowCorrectAnswer]);

  const handleConfirm = useCallback(() => {
    if (selectedCountry === null) {
      return;
    }

    onAnswerSubmit({
      countryCode: selectedCountry.code,
      type: "country",
    });
  }, [onAnswerSubmit, selectedCountry]);
  const handleButtonPress = shouldShowCorrectAnswer
    ? onNextQuestionPress
    : handleConfirm;

  return (
    <View className="gap-3">
      {shouldShowCorrectAnswer && (
        <View className="gap-1">
          <Text type="body-sm" weight="semibold" className="text-success">
            {t("train.session.answer.correct-answer-label")}
          </Text>
          <Text type="h4" className="text-success">
            {countryName}
          </Text>
        </View>
      )}
      <MapViewer
        key={countryCode}
        activeTargets={activeTargets}
        centersOn={centerTarget}
        className={answerMapClassName}
        highlights={highlights}
        isInteractive={!isDisabled}
        onCountryPressed={isDisabled ? undefined : setSelectedCountry}
        shouldLimitZoomOutToInitialViewport
      />
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

interface IsQuizzAnswerSubmissionCorrectParams {
  answer: QuizzAnswerSubmission;
  answerFormat: QuizzFormat;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

function isQuizzAnswerSubmissionCorrect({
  answer,
  answerFormat,
  country,
  geoLang,
}: IsQuizzAnswerSubmissionCorrectParams) {
  switch (answerFormat) {
    case "country-name":
    case "country-capital":
      return isTextAnswerSubmissionCorrect({
        answer,
        expectedAnswer: getQuizzTextAnswer({
          answerFormat,
          country,
          geoLang,
        }),
      });
    case "country-flag":
    case "country-position":
      return answer.type === "country" && answer.countryCode === country.code;
    default: {
      const exhaustiveFormat: never = answerFormat;

      return exhaustiveFormat;
    }
  }
}

interface IsTextAnswerSubmissionCorrectParams {
  answer: QuizzAnswerSubmission;
  expectedAnswer: string;
}

function isTextAnswerSubmissionCorrect({
  answer,
  expectedAnswer,
}: IsTextAnswerSubmissionCorrectParams) {
  if (answer.type !== "text") {
    return false;
  }

  return (
    normalizeQuizzTextAnswer(answer.value) ===
    normalizeQuizzTextAnswer(expectedAnswer)
  );
}

interface GetQuizzTextAnswerParams {
  answerFormat: Extract<QuizzFormat, "country-capital" | "country-name">;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

function getQuizzTextAnswer({
  answerFormat,
  country,
  geoLang,
}: GetQuizzTextAnswerParams) {
  switch (answerFormat) {
    case "country-name":
      return country.name[geoLang];
    case "country-capital":
      return country.capital[geoLang];
    default: {
      const exhaustiveFormat: never = answerFormat;

      return exhaustiveFormat;
    }
  }
}
