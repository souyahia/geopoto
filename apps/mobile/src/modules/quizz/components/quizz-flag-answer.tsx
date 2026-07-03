import { Text } from "heroui-native/text";
import { ArrowRight, Check } from "lucide-react-native";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

import {
  COUNTRIES,
  isCountryDisabled,
  type Country,
  type MapRegionName,
  type SupportedGeoLanguage,
} from "@geopoto/geo-data";
import {
  COUNTRY_FLAG_COLORS,
  type CountryFlagColor,
} from "@geopoto/geo-data/flag-colors";
import { getCountryFlag } from "@geopoto/geo-data/flags";

import { CountryFlag } from "@/components/country-flag";
import { FlagIcon } from "@/components/flag-icon";
import { HapticButton } from "@/components/haptic-button";
import { PAGE_CONTENT_MAX_WIDTH } from "@/components/page-content";
import { ThemedIcon } from "@/services/theme/themed-icon";
import { FLAG_COLOR_SWATCH_BY_COLOR } from "@/utils/flag-colors";
import { useGeoLangStore } from "@/utils/language/geo-lang-store";
import { shuffle } from "@/utils/random";

import type { QuizzAnswerSubmission } from "../hooks/use-quizz";
import type { AnswerDifficulty } from "../utils/quizz";

interface FlagAnswerContentProps {
  answerRegion: MapRegionName;
  country: Country;
  countryName: string;
  isDisabled: boolean;
  onAnswerSubmit: (answer: QuizzAnswerSubmission) => void;
  onNextQuestionPress: () => void;
  shouldShowCorrectAnswer: boolean;
}

interface QuizzFlagAnswerProps extends FlagAnswerContentProps {
  answerDifficulty: AnswerDifficulty;
}

interface FlagAnswerCountry {
  code: string;
  colors: readonly CountryFlagColor[];
  countryName: string;
}

interface FlagAnswerGridMetrics {
  colorFilterWidth: number;
  flagHeight: number;
  columns: number;
  flagWidth: number;
  itemHeight: number;
  itemWidth: number;
  rowHeight: number;
}

interface GetFlagAnswerGridMetricsParams {
  screenWidth: number;
}

interface GetFlagAnswerCountriesParams {
  geoLang: SupportedGeoLanguage;
}

interface ToFlagAnswerCountryParams {
  country: Country;
  geoLang: SupportedGeoLanguage;
}

interface FilterFlagAnswerCountriesParams {
  countries: readonly FlagAnswerCountry[];
  selectedColors: readonly CountryFlagColor[];
}

interface HasSelectedFlagColorsParams {
  country: FlagAnswerCountry;
  selectedColors: readonly CountryFlagColor[];
}

interface VisibleFlagAnswerRows {
  bottomSpacerHeight: number;
  rows: readonly number[];
  topSpacerHeight: number;
}

interface GetVisibleFlagAnswerRowsParams {
  columns: number;
  itemCount: number;
  rowHeight: number;
  scrollOffset: number;
  viewportHeight: number;
}

interface GetFlagAnswerGridRowCountriesParams {
  columns: number;
  countries: readonly FlagAnswerCountry[];
  rowIndex: number;
}

interface EasyFlagAnswerMetrics {
  flagHeight: number;
  flagWidth: number;
  itemHeight: number;
  itemWidth: number;
}

interface GetEasyFlagAnswerMetricsParams {
  screenWidth: number;
}

interface GetEasyFlagAnswerCountriesParams {
  answerRegion: MapRegionName;
  country: Country;
  geoLang: SupportedGeoLanguage;
}

interface GetFlagAnswerRowsParams {
  columns: number;
  countries: readonly FlagAnswerCountry[];
}

const FLAG_ANSWER_COLOR_FILTER_WIDTH = 104;
const FLAG_ANSWER_COMPACT_COLOR_FILTER_WIDTH = 88;
const FLAG_ANSWER_COMPACT_SCREEN_WIDTH = 360;
const FLAG_ANSWER_COLUMN_GAP = 8;
const FLAG_ANSWER_FRAME_PADDING = 4;
const FLAG_ANSWER_GRID_MAX_COLUMNS = 4;
const FLAG_ANSWER_GRID_MIN_COLUMNS = 2;
const FLAG_ANSWER_GRID_MIN_ITEM_WIDTH = 72;
const FLAG_ANSWER_GRID_ROW_GAP = 10;
const FLAG_ANSWER_HORIZONTAL_PADDING = 80;
const FLAG_ANSWER_ICON_MAX_WIDTH = 108;
const FLAG_ANSWER_ICON_ASPECT_RATIO = 4 / 3;
const FLAG_ANSWER_ICON_WIDTH_REDUCTION = 12;
const FLAG_ANSWER_LIST_HEIGHT = 248;
const FLAG_ANSWER_ROW_OVERSCAN = 3;
const FLAG_ANSWER_SCROLL_THROTTLE_MS = 16;
const EASY_FLAG_ANSWER_COLUMN_GAP = 10;
const EASY_FLAG_ANSWER_COLUMNS = 2;
const EASY_FLAG_ANSWER_FLAG_MAX_WIDTH = 144;
const EASY_FLAG_ANSWER_FLAG_WIDTH_REDUCTION = 16;
const EASY_FLAG_ANSWER_HORIZONTAL_PADDING = 104;
const EASY_FLAG_ANSWER_ITEM_MAX_WIDTH = 168;
const EASY_FLAG_ANSWER_OPTION_COUNT = 4;
const EASY_FLAG_ANSWER_ROW_GAP = 10;
const FLAG_ANSWER_CORRECT_FLAG_WIDTH = 48;
const FLAG_ANSWER_CORRECT_FLAG_HEIGHT = Math.round(
  FLAG_ANSWER_CORRECT_FLAG_WIDTH / FLAG_ANSWER_ICON_ASPECT_RATIO,
);
const FLAG_ANSWER_GRID_ROW_STYLE = {
  flexDirection: "row",
  gap: FLAG_ANSWER_COLUMN_GAP,
} satisfies ViewStyle;
const EASY_FLAG_ANSWER_GRID_ROW_STYLE = {
  flexDirection: "row",
  gap: EASY_FLAG_ANSWER_COLUMN_GAP,
} satisfies ViewStyle;

function getFlagAnswerCountryKey(country: FlagAnswerCountry) {
  return country.code;
}

function getFlagAnswerGridRowKey(rowIndex: number) {
  return `flag-answer-row-${rowIndex}`;
}

function getFlagAnswerGridMetrics({
  screenWidth,
}: GetFlagAnswerGridMetricsParams): FlagAnswerGridMetrics {
  const isCompactScreen = screenWidth < FLAG_ANSWER_COMPACT_SCREEN_WIDTH;
  const colorFilterWidth = isCompactScreen
    ? FLAG_ANSWER_COMPACT_COLOR_FILTER_WIDTH
    : FLAG_ANSWER_COLOR_FILTER_WIDTH;
  const contentWidth = Math.max(
    1,
    screenWidth - FLAG_ANSWER_HORIZONTAL_PADDING,
  );
  const listWidth = Math.max(
    1,
    contentWidth - colorFilterWidth - FLAG_ANSWER_COLUMN_GAP,
  );
  const columnCapacity = Math.floor(
    (listWidth + FLAG_ANSWER_COLUMN_GAP) /
      (FLAG_ANSWER_GRID_MIN_ITEM_WIDTH + FLAG_ANSWER_COLUMN_GAP),
  );
  const columns = Math.min(
    FLAG_ANSWER_GRID_MAX_COLUMNS,
    Math.max(FLAG_ANSWER_GRID_MIN_COLUMNS, columnCapacity),
  );
  const itemWidth = Math.max(
    1,
    Math.floor((listWidth - FLAG_ANSWER_COLUMN_GAP * (columns - 1)) / columns),
  );
  const flagWidth = Math.max(
    1,
    Math.min(FLAG_ANSWER_ICON_MAX_WIDTH, itemWidth) -
      FLAG_ANSWER_FRAME_PADDING * 2 -
      FLAG_ANSWER_ICON_WIDTH_REDUCTION,
  );
  const flagHeight = Math.round(flagWidth / FLAG_ANSWER_ICON_ASPECT_RATIO);
  const itemHeight = flagHeight + FLAG_ANSWER_FRAME_PADDING * 2;

  return {
    colorFilterWidth,
    columns,
    flagHeight,
    flagWidth,
    itemHeight,
    itemWidth,
    rowHeight: itemHeight + FLAG_ANSWER_GRID_ROW_GAP,
  };
}

function getEasyFlagAnswerMetrics({
  screenWidth,
}: GetEasyFlagAnswerMetricsParams): EasyFlagAnswerMetrics {
  const contentWidth = Math.max(
    1,
    screenWidth - EASY_FLAG_ANSWER_HORIZONTAL_PADDING,
  );
  const itemWidth = Math.min(
    EASY_FLAG_ANSWER_ITEM_MAX_WIDTH,
    Math.max(
      1,
      Math.floor(
        (contentWidth - EASY_FLAG_ANSWER_COLUMN_GAP) / EASY_FLAG_ANSWER_COLUMNS,
      ),
    ),
  );
  const flagWidth = Math.max(
    1,
    Math.min(EASY_FLAG_ANSWER_FLAG_MAX_WIDTH, itemWidth - 12) -
      EASY_FLAG_ANSWER_FLAG_WIDTH_REDUCTION,
  );
  const flagHeight = Math.round(flagWidth / FLAG_ANSWER_ICON_ASPECT_RATIO);
  const itemHeight = flagHeight + 12;

  return {
    flagHeight,
    flagWidth,
    itemHeight,
    itemWidth,
  };
}

function getFlagAnswerCountries({
  geoLang,
}: GetFlagAnswerCountriesParams): readonly FlagAnswerCountry[] {
  const countries = COUNTRIES.filter(
    (country) => !isCountryDisabled(country.code),
  ).flatMap((country) => toFlagAnswerCountry({ country, geoLang }));

  return shuffle(countries);
}

function getEasyFlagAnswerCountries({
  answerRegion,
  country,
  geoLang,
}: GetEasyFlagAnswerCountriesParams): readonly FlagAnswerCountry[] {
  const correctCountry = toFlagAnswerCountry({ country, geoLang }).at(0);

  if (correctCountry === undefined) {
    return [];
  }

  const selectedDistractorCountries = getEasyDistractorCountries({
    answerRegion,
    country,
  }).flatMap((distractorCountry) =>
    toFlagAnswerCountry({ country: distractorCountry, geoLang }),
  );

  return shuffle([correctCountry, ...selectedDistractorCountries]);
}

interface GetEasyDistractorCountriesParams {
  answerRegion: MapRegionName;
  country: Country;
}

function getEasyDistractorCountries({
  answerRegion,
  country,
}: GetEasyDistractorCountriesParams): readonly Country[] {
  const distractorCount = EASY_FLAG_ANSWER_OPTION_COUNT - 1;
  const otherCountries = COUNTRIES.filter(
    (candidateCountry) =>
      !isCountryDisabled(candidateCountry.code) &&
      candidateCountry.code !== country.code,
  );
  const regionCountries = otherCountries.filter((candidateCountry) =>
    candidateCountry.regions.includes(answerRegion),
  );
  const selectedRegionCountries = shuffle(regionCountries).slice(
    0,
    distractorCount,
  );

  if (selectedRegionCountries.length >= distractorCount) {
    return selectedRegionCountries;
  }

  const selectedCodes = new Set(
    selectedRegionCountries.map((selectedCountry) => selectedCountry.code),
  );
  const fallbackCountries = shuffle(
    otherCountries.filter(
      (candidateCountry) => !selectedCodes.has(candidateCountry.code),
    ),
  ).slice(0, distractorCount - selectedRegionCountries.length);

  return [...selectedRegionCountries, ...fallbackCountries];
}

function toFlagAnswerCountry({
  country,
  geoLang,
}: ToFlagAnswerCountryParams): readonly FlagAnswerCountry[] {
  const flag = getCountryFlag(country.code);

  if (flag === null) {
    return [];
  }

  return [
    {
      code: country.code,
      colors: flag.colors,
      countryName: country.name[geoLang],
    },
  ];
}

function filterFlagAnswerCountries({
  countries,
  selectedColors,
}: FilterFlagAnswerCountriesParams): readonly FlagAnswerCountry[] {
  if (selectedColors.length === 0) {
    return countries;
  }

  return countries.filter((country) =>
    hasSelectedFlagColors({ country, selectedColors }),
  );
}

function hasSelectedFlagColors({
  country,
  selectedColors,
}: HasSelectedFlagColorsParams) {
  return selectedColors.every((color) => country.colors.includes(color));
}

function getVisibleFlagAnswerRows({
  columns,
  itemCount,
  rowHeight,
  scrollOffset,
  viewportHeight,
}: GetVisibleFlagAnswerRowsParams): VisibleFlagAnswerRows {
  const rowCount = Math.ceil(itemCount / columns);
  const startRow = Math.max(
    0,
    Math.floor(scrollOffset / rowHeight) - FLAG_ANSWER_ROW_OVERSCAN,
  );
  const endRow = Math.min(
    rowCount,
    Math.ceil((scrollOffset + viewportHeight) / rowHeight) +
      FLAG_ANSWER_ROW_OVERSCAN,
  );
  const visibleRowCount = Math.max(endRow - startRow, 0);

  return {
    bottomSpacerHeight: Math.max(rowCount - endRow, 0) * rowHeight,
    rows: Array.from(
      { length: visibleRowCount },
      (_value, index) => startRow + index,
    ),
    topSpacerHeight: startRow * rowHeight,
  };
}

function getFlagAnswerGridRowCountries({
  columns,
  countries,
  rowIndex,
}: GetFlagAnswerGridRowCountriesParams): readonly FlagAnswerCountry[] {
  const startIndex = rowIndex * columns;

  return countries.slice(startIndex, startIndex + columns);
}

function getFlagAnswerRows({
  columns,
  countries,
}: GetFlagAnswerRowsParams): readonly (readonly FlagAnswerCountry[])[] {
  return Array.from(
    { length: Math.ceil(countries.length / columns) },
    (_value, rowIndex) =>
      getFlagAnswerGridRowCountries({
        columns,
        countries,
        rowIndex,
      }),
  );
}

export function QuizzFlagAnswer({
  answerDifficulty,
  answerRegion,
  country,
  countryName,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: QuizzFlagAnswerProps) {
  const flagAnswerProps = {
    answerRegion,
    country,
    countryName,
    isDisabled,
    onAnswerSubmit,
    onNextQuestionPress,
    shouldShowCorrectAnswer,
  } satisfies FlagAnswerContentProps;

  switch (answerDifficulty) {
    case "easy":
      return <EasyFlagAnswer {...flagAnswerProps} />;
    case "hard":
      return <HardFlagAnswer {...flagAnswerProps} />;
    default: {
      const exhaustiveAnswerDifficulty: never = answerDifficulty;

      return exhaustiveAnswerDifficulty;
    }
  }
}

function HardFlagAnswer({
  country,
  countryName,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: FlagAnswerContentProps) {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const { width } = useWindowDimensions();
  const answerContentWidth = Math.min(width, PAGE_CONTENT_MAX_WIDTH);
  const listRef = useRef<ScrollView>(null);
  const [selectedColors, setSelectedColors] = useState<
    readonly CountryFlagColor[]
  >([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );
  const flagGridMetrics = useMemo(
    () => getFlagAnswerGridMetrics({ screenWidth: answerContentWidth }),
    [answerContentWidth],
  );
  const flagCountries = useMemo(
    () => getFlagAnswerCountries({ geoLang }),
    [geoLang],
  );
  const filteredFlagCountries = useMemo(
    () =>
      filterFlagAnswerCountries({
        countries: flagCountries,
        selectedColors,
      }),
    [flagCountries, selectedColors],
  );
  const hasSelectedCountry = selectedCountryCode !== null;
  const isAnswerButtonDisabled =
    !shouldShowCorrectAnswer && (isDisabled || !hasSelectedCountry);
  const answerButtonLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.next")
    : t("train.session.answer.confirm");
  const AnswerButtonIcon = shouldShowCorrectAnswer ? ArrowRight : Check;

  useEffect(() => {
    listRef.current?.scrollTo({ animated: false, y: 0 });
  }, [selectedColors]);

  useEffect(() => {
    if (shouldShowCorrectAnswer) {
      setSelectedColors([]);
      setSelectedCountryCode(country.code);
      return;
    }

    setSelectedCountryCode(null);
  }, [country.code, shouldShowCorrectAnswer]);

  const handleColorToggle = useCallback((color: CountryFlagColor) => {
    setSelectedColors((previousSelectedColors) =>
      getNextSelectedColors({
        color,
        selectedColors: previousSelectedColors,
      }),
    );
  }, []);

  const handleCountryPress = useCallback((nextCountryCode: string) => {
    setSelectedCountryCode(nextCountryCode);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedCountryCode === null) {
      return;
    }

    onAnswerSubmit({
      countryCode: selectedCountryCode,
      type: "country",
    });
  }, [onAnswerSubmit, selectedCountryCode]);

  const handleButtonPress = shouldShowCorrectAnswer
    ? onNextQuestionPress
    : handleConfirm;

  return (
    <View className="gap-3">
      {shouldShowCorrectAnswer && (
        <CorrectFlagAnswer
          countryCode={country.code}
          countryName={countryName}
          shouldUseHighResolutionFlag={false}
        />
      )}
      <View className="flex-row gap-2">
        <FlagColorToggleList
          filterWidth={flagGridMetrics.colorFilterWidth}
          isDisabled={isDisabled}
          onColorToggle={handleColorToggle}
          selectedColors={selectedColors}
        />
        <FlagAnswerGrid
          key={selectedColors.join("|")}
          countries={filteredFlagCountries}
          flagGridMetrics={flagGridMetrics}
          isDisabled={isDisabled}
          listRef={listRef}
          onCountryPress={handleCountryPress}
          selectedCountryCode={selectedCountryCode}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
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

function EasyFlagAnswer({
  answerRegion,
  country,
  countryName,
  isDisabled,
  onAnswerSubmit,
  onNextQuestionPress,
  shouldShowCorrectAnswer,
}: FlagAnswerContentProps) {
  const { t } = useTranslation();
  const { geoLang } = useGeoLangStore();
  const { width } = useWindowDimensions();
  const answerContentWidth = Math.min(width, PAGE_CONTENT_MAX_WIDTH);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );
  const flagAnswerMetrics = useMemo(
    () => getEasyFlagAnswerMetrics({ screenWidth: answerContentWidth }),
    [answerContentWidth],
  );
  const flagCountries = useMemo(
    () => getEasyFlagAnswerCountries({ answerRegion, country, geoLang }),
    [answerRegion, country, geoLang],
  );
  const hasSelectedCountry = selectedCountryCode !== null;
  const isAnswerButtonDisabled =
    !shouldShowCorrectAnswer && (isDisabled || !hasSelectedCountry);
  const answerButtonLabel = shouldShowCorrectAnswer
    ? t("train.session.answer.next")
    : t("train.session.answer.confirm");
  const AnswerButtonIcon = shouldShowCorrectAnswer ? ArrowRight : Check;

  useEffect(() => {
    if (shouldShowCorrectAnswer) {
      setSelectedCountryCode(country.code);
      return;
    }

    setSelectedCountryCode(null);
  }, [country.code, shouldShowCorrectAnswer]);

  const handleCountryPress = useCallback((nextCountryCode: string) => {
    setSelectedCountryCode(nextCountryCode);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedCountryCode === null) {
      return;
    }

    onAnswerSubmit({
      countryCode: selectedCountryCode,
      type: "country",
    });
  }, [onAnswerSubmit, selectedCountryCode]);

  const handleButtonPress = shouldShowCorrectAnswer
    ? onNextQuestionPress
    : handleConfirm;

  return (
    <View className="gap-3">
      {shouldShowCorrectAnswer && (
        <CorrectFlagAnswer
          countryCode={country.code}
          countryName={countryName}
          shouldUseHighResolutionFlag
        />
      )}
      <EasyFlagAnswerGrid
        countries={flagCountries}
        flagAnswerMetrics={flagAnswerMetrics}
        isDisabled={isDisabled}
        onCountryPress={handleCountryPress}
        selectedCountryCode={selectedCountryCode}
        shouldShowCorrectAnswer={shouldShowCorrectAnswer}
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

interface EasyFlagAnswerGridProps {
  countries: readonly FlagAnswerCountry[];
  flagAnswerMetrics: EasyFlagAnswerMetrics;
  isDisabled: boolean;
  onCountryPress: (countryCode: string) => void;
  selectedCountryCode: string | null;
  shouldShowCorrectAnswer: boolean;
}

function EasyFlagAnswerGrid({
  countries,
  flagAnswerMetrics,
  isDisabled,
  onCountryPress,
  selectedCountryCode,
  shouldShowCorrectAnswer,
}: EasyFlagAnswerGridProps) {
  const rows = useMemo(
    () =>
      getFlagAnswerRows({
        columns: EASY_FLAG_ANSWER_COLUMNS,
        countries,
      }),
    [countries],
  );

  if (countries.length === 0) {
    return (
      <FlagAnswerEmpty
        height={flagAnswerMetrics.itemHeight * EASY_FLAG_ANSWER_COLUMNS}
      />
    );
  }

  return (
    <View className="items-center" style={{ gap: EASY_FLAG_ANSWER_ROW_GAP }}>
      {rows.map((row) => (
        <View
          key={row.map(getFlagAnswerCountryKey).join("|")}
          style={EASY_FLAG_ANSWER_GRID_ROW_STYLE}
        >
          {row.map((country) => {
            const isSelected = country.code === selectedCountryCode;

            return (
              <FlagAnswerGridItem
                country={country}
                flagHeight={flagAnswerMetrics.flagHeight}
                flagWidth={flagAnswerMetrics.flagWidth}
                isDisabled={isDisabled}
                isSelected={isSelected}
                itemHeight={flagAnswerMetrics.itemHeight}
                itemMarginBottom={0}
                itemWidth={flagAnswerMetrics.itemWidth}
                key={getFlagAnswerCountryKey(country)}
                onCountryPress={onCountryPress}
                shouldUseHighResolutionFlag
                shouldUseSuccessStyle={shouldShowCorrectAnswer && isSelected}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

interface FlagAnswerGridProps {
  countries: readonly FlagAnswerCountry[];
  flagGridMetrics: FlagAnswerGridMetrics;
  isDisabled: boolean;
  listRef: RefObject<ScrollView | null>;
  onCountryPress: (countryCode: string) => void;
  selectedCountryCode: string | null;
  shouldShowCorrectAnswer: boolean;
}

function FlagAnswerGrid({
  countries,
  flagGridMetrics,
  isDisabled,
  listRef,
  onCountryPress,
  selectedCountryCode,
  shouldShowCorrectAnswer,
}: FlagAnswerGridProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const visibleRows = useMemo(
    () =>
      getVisibleFlagAnswerRows({
        columns: flagGridMetrics.columns,
        itemCount: countries.length,
        rowHeight: flagGridMetrics.rowHeight,
        scrollOffset,
        viewportHeight: FLAG_ANSWER_LIST_HEIGHT,
      }),
    [
      countries.length,
      flagGridMetrics.columns,
      flagGridMetrics.rowHeight,
      scrollOffset,
    ],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(event.nativeEvent.contentOffset.y);
    },
    [],
  );

  if (countries.length === 0) {
    return <FlagAnswerEmpty />;
  }

  return (
    <ScrollView
      ref={listRef}
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      onScroll={handleScroll}
      scrollEventThrottle={FLAG_ANSWER_SCROLL_THROTTLE_MS}
      style={{ height: FLAG_ANSWER_LIST_HEIGHT }}
    >
      <View style={{ height: visibleRows.topSpacerHeight }} />
      {visibleRows.rows.map((rowIndex) => (
        <FlagAnswerGridRow
          countries={getFlagAnswerGridRowCountries({
            columns: flagGridMetrics.columns,
            countries,
            rowIndex,
          })}
          flagWidth={flagGridMetrics.flagWidth}
          flagHeight={flagGridMetrics.flagHeight}
          isDisabled={isDisabled}
          itemHeight={flagGridMetrics.itemHeight}
          itemWidth={flagGridMetrics.itemWidth}
          key={getFlagAnswerGridRowKey(rowIndex)}
          onCountryPress={onCountryPress}
          selectedCountryCode={selectedCountryCode}
          shouldShowCorrectAnswer={shouldShowCorrectAnswer}
        />
      ))}
      <View style={{ height: visibleRows.bottomSpacerHeight }} />
    </ScrollView>
  );
}

interface FlagAnswerGridRowProps {
  countries: readonly FlagAnswerCountry[];
  flagHeight: number;
  flagWidth: number;
  isDisabled: boolean;
  itemHeight: number;
  itemWidth: number;
  onCountryPress: (countryCode: string) => void;
  selectedCountryCode: string | null;
  shouldShowCorrectAnswer: boolean;
}

function FlagAnswerGridRow({
  countries,
  flagHeight,
  flagWidth,
  isDisabled,
  itemHeight,
  itemWidth,
  onCountryPress,
  selectedCountryCode,
  shouldShowCorrectAnswer,
}: FlagAnswerGridRowProps) {
  return (
    <View style={FLAG_ANSWER_GRID_ROW_STYLE}>
      {countries.map((country) => {
        const isSelected = country.code === selectedCountryCode;

        return (
          <FlagAnswerGridItem
            country={country}
            flagHeight={flagHeight}
            flagWidth={flagWidth}
            isDisabled={isDisabled}
            isSelected={isSelected}
            itemHeight={itemHeight}
            itemMarginBottom={FLAG_ANSWER_GRID_ROW_GAP}
            itemWidth={itemWidth}
            key={getFlagAnswerCountryKey(country)}
            onCountryPress={onCountryPress}
            shouldUseHighResolutionFlag={false}
            shouldUseSuccessStyle={shouldShowCorrectAnswer && isSelected}
          />
        );
      })}
    </View>
  );
}

interface CorrectFlagAnswerProps {
  countryCode: string;
  countryName: string;
  shouldUseHighResolutionFlag: boolean;
}

function CorrectFlagAnswer({
  countryCode,
  countryName,
  shouldUseHighResolutionFlag,
}: CorrectFlagAnswerProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <Text type="body-sm" weight="semibold" className="text-success">
        {t("train.session.answer.correct-answer-label")}
      </Text>
      <View className="flex-row items-center gap-3">
        <FlagAnswerImage
          accessibilityLabel={t("train.session.answer.flag-option-label", {
            country: countryName,
          })}
          countryCode={countryCode}
          height={FLAG_ANSWER_CORRECT_FLAG_HEIGHT}
          shouldUseHighResolutionFlag={shouldUseHighResolutionFlag}
          width={FLAG_ANSWER_CORRECT_FLAG_WIDTH}
        />
        <Text type="h4" className="flex-1 text-success">
          {countryName}
        </Text>
      </View>
    </View>
  );
}

interface FlagColorToggleListProps {
  filterWidth: number;
  isDisabled: boolean;
  onColorToggle: (color: CountryFlagColor) => void;
  selectedColors: readonly CountryFlagColor[];
}

function FlagColorToggleList({
  filterWidth,
  isDisabled,
  onColorToggle,
  selectedColors,
}: FlagColorToggleListProps) {
  const containerStyle = useMemo<ViewStyle>(
    () => ({
      height: FLAG_ANSWER_LIST_HEIGHT,
      width: filterWidth,
    }),
    [filterWidth],
  );

  return (
    <View
      className="shrink-0 overflow-hidden rounded-xl"
      style={containerStyle}
    >
      {COUNTRY_FLAG_COLORS.map((color) => (
        <FlagColorToggle
          color={color}
          isDisabled={isDisabled}
          isSelected={selectedColors.includes(color)}
          key={color}
          onColorToggle={onColorToggle}
        />
      ))}
    </View>
  );
}

interface FlagColorToggleProps {
  color: CountryFlagColor;
  isDisabled: boolean;
  isSelected: boolean;
  onColorToggle: (color: CountryFlagColor) => void;
}

function FlagColorToggle({
  color,
  isDisabled,
  isSelected,
  onColorToggle,
}: FlagColorToggleProps) {
  const { t } = useTranslation();
  const label = t(`learn.flags.colors.options.${color}`);
  const item = (
    <FlagColorToggleContent
      color={color}
      isDisabled={isDisabled}
      isSelected={isSelected}
      label={label}
    />
  );
  const handlePress = useCallback(() => {
    onColorToggle(color);
  }, [color, onColorToggle]);

  if (isDisabled) {
    return item;
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      onPress={handlePress}
    >
      {item}
    </Pressable>
  );
}

interface FlagColorToggleContentProps {
  color: CountryFlagColor;
  isDisabled: boolean;
  isSelected: boolean;
  label: string;
}

function FlagColorToggleContent({
  color,
  isDisabled,
  isSelected,
  label,
}: FlagColorToggleContentProps) {
  return (
    <View
      className={[
        "h-7 flex-row items-center gap-1.5 px-1.5",
        isDisabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <FlagColorToggleMark isSelected={isSelected} />
      <View
        className="size-3 rounded-full border border-border"
        style={{ backgroundColor: FLAG_COLOR_SWATCH_BY_COLOR[color] }}
      />
      <Text type="body-xs" numberOfLines={1} className="flex-1">
        {label}
      </Text>
    </View>
  );
}

interface FlagColorToggleMarkProps {
  isSelected: boolean;
}

function FlagColorToggleMark({ isSelected }: FlagColorToggleMarkProps) {
  return (
    <View
      className={[
        "size-5 items-center justify-center rounded-md border",
        isSelected ? "border-accent bg-accent" : "border-border bg-field",
      ].join(" ")}
      pointerEvents="none"
    >
      {isSelected && (
        <ThemedIcon
          colorClassName="text-accent-foreground"
          icon={Check}
          size={13}
          strokeWidth={3}
        />
      )}
    </View>
  );
}

interface GetNextSelectedColorsParams {
  color: CountryFlagColor;
  selectedColors: readonly CountryFlagColor[];
}

function getNextSelectedColors({
  color,
  selectedColors,
}: GetNextSelectedColorsParams): readonly CountryFlagColor[] {
  const isAlreadySelected = selectedColors.includes(color);

  if (isAlreadySelected) {
    return selectedColors.filter((selectedColor) => selectedColor !== color);
  }

  return [...selectedColors, color];
}

interface FlagAnswerGridItemProps {
  country: FlagAnswerCountry;
  flagHeight: number;
  flagWidth: number;
  isDisabled: boolean;
  isSelected: boolean;
  itemHeight: number;
  itemMarginBottom: number;
  itemWidth: number;
  onCountryPress: (countryCode: string) => void;
  shouldUseHighResolutionFlag: boolean;
  shouldUseSuccessStyle: boolean;
}

function FlagAnswerGridItemComponent({
  country,
  flagHeight,
  flagWidth,
  isDisabled,
  isSelected,
  itemHeight,
  itemMarginBottom,
  itemWidth,
  onCountryPress,
  shouldUseHighResolutionFlag,
  shouldUseSuccessStyle,
}: FlagAnswerGridItemProps) {
  const { t } = useTranslation();
  const containerStyle = useMemo<ViewStyle>(
    () => ({
      height: itemHeight,
      marginBottom: itemMarginBottom,
      width: itemWidth,
    }),
    [itemHeight, itemMarginBottom, itemWidth],
  );
  const frameStyle = useMemo<ViewStyle>(
    () => ({
      height: itemHeight,
      width: itemWidth,
    }),
    [itemHeight, itemWidth],
  );
  const content = (
    <View
      className={[
        "items-center justify-center overflow-hidden rounded-lg border bg-field p-1",
        getFlagAnswerGridItemClassName({ isSelected, shouldUseSuccessStyle }),
      ].join(" ")}
      style={frameStyle}
    >
      <FlagAnswerImage
        accessibilityLabel={t("train.session.answer.flag-option-label", {
          country: country.countryName,
        })}
        countryCode={country.code}
        height={flagHeight}
        shouldUseHighResolutionFlag={shouldUseHighResolutionFlag}
        width={flagWidth}
      />
    </View>
  );
  const handlePress = useCallback(() => {
    onCountryPress(country.code);
  }, [country.code, onCountryPress]);

  if (isDisabled) {
    return <View style={containerStyle}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={t("train.session.answer.flag-option-label", {
        country: country.countryName,
      })}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={handlePress}
      style={containerStyle}
    >
      {content}
    </Pressable>
  );
}

const FlagAnswerGridItem = memo(FlagAnswerGridItemComponent);

interface FlagAnswerImageProps {
  accessibilityLabel: string;
  countryCode: string;
  height: number;
  shouldUseHighResolutionFlag: boolean;
  width: number;
}

function FlagAnswerImage({
  accessibilityLabel,
  countryCode,
  height,
  shouldUseHighResolutionFlag,
  width,
}: FlagAnswerImageProps) {
  if (shouldUseHighResolutionFlag) {
    return (
      <CountryFlag
        accessibilityLabel={accessibilityLabel}
        code={countryCode}
        height={height}
        width={width}
      />
    );
  }

  return (
    <FlagIcon
      accessibilityLabel={accessibilityLabel}
      code={countryCode}
      width={width}
    />
  );
}

interface GetFlagAnswerGridItemClassNameParams {
  isSelected: boolean;
  shouldUseSuccessStyle: boolean;
}

function getFlagAnswerGridItemClassName({
  isSelected,
  shouldUseSuccessStyle,
}: GetFlagAnswerGridItemClassNameParams) {
  if (shouldUseSuccessStyle) {
    return "border-success bg-success/10";
  }

  if (isSelected) {
    return "border-2 border-accent bg-accent/10";
  }

  return "border-border";
}

interface FlagAnswerEmptyProps {
  height?: number;
}

function FlagAnswerEmpty({
  height = FLAG_ANSWER_LIST_HEIGHT,
}: FlagAnswerEmptyProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center justify-center px-3" style={{ height }}>
      <Text type="body-sm" color="muted" align="center">
        {t("train.session.answer.flag-empty")}
      </Text>
    </View>
  );
}
