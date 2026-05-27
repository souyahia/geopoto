import { Input } from "heroui-native/input";
import { Surface } from "heroui-native/surface";
import { Text } from "heroui-native/text";
import type { TFunction } from "i18next";
import { Check } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, useWindowDimensions } from "react-native";

import type { Country, MapRegionName } from "@geopoto/geo-data";
import { getCountryFlag } from "@geopoto/geo-data/flags";

import { CountryFlag } from "@/components/country-flag";
import { HapticButton } from "@/components/haptic-button";
import { MapViewer } from "@/modules/map-viewer/components/map-viewer";
import type {
  MapViewerHighlight,
  MapViewerHighlightTarget,
} from "@/modules/map-viewer/utils/map-viewer-viewport";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";

import {
  normalizeQuizzTextAnswer,
  type QuizzAnswerSubmission,
} from "../hooks/use-quizz";
import type { QuizzFormat } from "../utils/quizz";

const EMPTY_QUIZZ_QUESTION_HIGHLIGHTS: readonly MapViewerHighlight[] = [];
const QUIZZ_QUESTION_MAP_CLASS_NAME = "h-72";
const QUIZZ_ANSWER_MAP_CLASS_NAME = "h-80";
const QUESTION_FLAG_FALLBACK_ASPECT_RATIO = 3 / 2;
const QUESTION_FLAG_HORIZONTAL_PADDING = 96;
const QUESTION_FLAG_MAX_HEIGHT = 220;
const QUESTION_FLAG_MAX_WIDTH = 360;

interface QuizzQuestionCardProps {
  answerFormat: QuizzFormat;
  answerRegion: MapRegionName;
  country: Country;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  questionFormat: QuizzFormat;
}

export function QuizzQuestionCard({
  answerFormat,
  answerRegion,
  country,
  onAnswerSubmit,
  questionFormat,
}: QuizzQuestionCardProps) {
  const { geoLang } = useGeoLangStore();
  const countryName = country.name[geoLang];
  const capitalName = country.capital[geoLang];
  const questionSurfaceClassName = getQuestionSurfaceClassName({
    questionFormat,
  });

  return (
    <View className="gap-5">
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
          countryCode={country.code}
          onAnswerSubmit={onAnswerSubmit}
        />
      </Surface>
    </View>
  );
}

interface GetQuestionSurfaceClassNameParams {
  questionFormat: QuizzFormat;
}

function getQuestionSurfaceClassName({
  questionFormat,
}: GetQuestionSurfaceClassNameParams) {
  if (isTextQuestionFormat({ questionFormat })) {
    return "justify-center gap-4 py-6";
  }

  return "min-h-64 justify-center gap-4";
}

interface IsTextQuestionFormatParams {
  questionFormat: QuizzFormat;
}

function isTextQuestionFormat({ questionFormat }: IsTextQuestionFormatParams) {
  switch (questionFormat) {
    case "country-name":
    case "country-capital":
      return true;
    case "country-flag":
    case "country-position":
      return false;
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
  switch (questionFormat) {
    case "country-name":
      return (
        <Text type="h2" align="center">
          {countryName}
        </Text>
      );
    case "country-capital":
      return (
        <Text type="h2" align="center">
          {capitalName}
        </Text>
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
  countryCode: string;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
}

function QuizzQuestionAnswer({
  answerFormat,
  answerRegion,
  countryCode,
  onAnswerSubmit,
}: QuizzQuestionAnswerProps) {
  switch (answerFormat) {
    case "country-name":
    case "country-capital":
      return (
        <TextAnswer
          answerFormat={answerFormat}
          countryCode={countryCode}
          onAnswerSubmit={onAnswerSubmit}
        />
      );
    case "country-flag":
    case "country-position":
      return (
        <CountrySelectionAnswer
          answerRegion={answerRegion}
          countryCode={countryCode}
          onAnswerSubmit={onAnswerSubmit}
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
  countryCode: string;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
}

function TextAnswer({
  answerFormat,
  countryCode,
  onAnswerSubmit,
}: TextAnswerProps) {
  const { t } = useTranslation();
  const [answerValue, setAnswerValue] = useState("");
  const isSubmitDisabled = normalizeQuizzTextAnswer(answerValue).length === 0;
  const answerInputLabel = getTextAnswerInputLabel({ answerFormat, t });

  useEffect(() => {
    setAnswerValue("");
  }, [answerFormat, countryCode]);

  const handleSubmit = useCallback(() => {
    if (isSubmitDisabled) {
      return;
    }

    onAnswerSubmit({
      type: "text",
      value: answerValue,
    });
  }, [answerValue, isSubmitDisabled, onAnswerSubmit]);

  return (
    <View className="gap-3">
      <Text type="body-sm" weight="semibold">
        {answerInputLabel}
      </Text>
      <Input
        accessibilityLabel={t("train.session.answer.text-input-label")}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        onChangeText={setAnswerValue}
        onSubmitEditing={handleSubmit}
        placeholder={t("train.session.answer.text-input-placeholder")}
        returnKeyType="done"
        spellCheck={false}
        value={answerValue}
      />
      <HapticButton
        isDisabled={isSubmitDisabled}
        onPress={handleSubmit}
        variant="primary"
      >
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={Check}
          size={18}
        />
        <HapticButton.Label>
          {t("train.session.answer.submit")}
        </HapticButton.Label>
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
  countryCode: string;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
}

function CountrySelectionAnswer({
  answerRegion,
  countryCode,
  onAnswerSubmit,
}: CountrySelectionAnswerProps) {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const activeTargets = useMemo<readonly MapViewerHighlightTarget[]>(
    () => [
      {
        region: answerRegion,
        type: "region",
      },
    ],
    [answerRegion],
  );
  const highlights = useMemo<readonly MapViewerHighlight[]>(() => {
    if (selectedCountry === null) {
      return EMPTY_QUIZZ_QUESTION_HIGHLIGHTS;
    }

    return [
      {
        target: {
          country: selectedCountry,
          type: "country",
        },
      },
    ];
  }, [selectedCountry]);
  const isConfirmDisabled = selectedCountry === null;

  useEffect(() => {
    setSelectedCountry(null);
  }, [countryCode]);

  const handleConfirm = useCallback(() => {
    if (selectedCountry === null) {
      return;
    }

    onAnswerSubmit({
      countryCode: selectedCountry.code,
      type: "country",
    });
  }, [onAnswerSubmit, selectedCountry]);

  return (
    <View className="gap-3">
      <MapViewer
        key={countryCode}
        activeTargets={activeTargets}
        centersOn={{
          region: answerRegion,
          type: "region",
        }}
        className={QUIZZ_ANSWER_MAP_CLASS_NAME}
        highlights={highlights}
        isInteractive
        onCountryPressed={setSelectedCountry}
        shouldLimitZoomOutToInitialViewport
      />
      <HapticButton
        isDisabled={isConfirmDisabled}
        onPress={handleConfirm}
        variant="primary"
      >
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={Check}
          size={18}
        />
        <HapticButton.Label>
          {t("train.session.answer.confirm")}
        </HapticButton.Label>
      </HapticButton>
    </View>
  );
}
