import type { Country, MapRegionName } from "@geopoto/geo-data";
import { COUNTRIES } from "@geopoto/geo-data";

import type { AdaptiveHistoryEntry } from "@/modules/adaptive-difficulty/utils/adaptive-history-storage";
import {
  getAdaptiveItemWeight,
  pickAdaptiveWeightedRandomItem,
  type AdaptivePracticeItemAggregate,
} from "@/modules/adaptive-difficulty/utils/adaptive-weighting";
import { pickRandom, shuffle } from "@/utils/random";

export const QUIZZ_FORMATS = [
  "country-name",
  "country-capital",
  "country-flag",
  "country-position",
] as const;

export type QuizzFormat = (typeof QUIZZ_FORMATS)[number];

export const QUIZZ_ANSWER_FORMATS = [
  "country-name",
  "country-capital",
  "country-flag",
  "country-position",
] satisfies readonly QuizzFormat[];

export const ANSWER_DIFFICULTIES = ["easy", "hard"] as const;

export interface QuizzQuestion {
  countryCode: string;
  questionFormat: QuizzFormat;
  answerFormat: QuizzFormat;
}

export type PracticeItem = QuizzQuestion;

export type AnswerDifficulty = (typeof ANSWER_DIFFICULTIES)[number];

export interface QuizzOptions {
  regions: MapRegionName[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  acceptedAnswerFormats: readonly QuizzFormat[];
  answerDifficulty: AnswerDifficulty;
  isInfiniteMode: boolean;
  limit?: number;
}

export type CountryQuestionCounts = Readonly<
  Record<string, number | undefined>
>;

export function isQuizzFormat(value: unknown): value is QuizzFormat {
  return QUIZZ_FORMATS.some((format) => format === value);
}

export function isAnswerDifficulty(value: unknown): value is AnswerDifficulty {
  return ANSWER_DIFFICULTIES.some((difficulty) => difficulty === value);
}

export interface CreateQuizzParams extends QuizzOptions {
  adaptiveHistoryEntries?: readonly AdaptiveHistoryEntry[];
  isAdaptiveDifficultySelectionEnabled?: boolean;
}

export function createQuizz({
  acceptedQuestionFormats,
  acceptedAnswerFormats,
  adaptiveHistoryEntries = [],
  isAdaptiveDifficultySelectionEnabled = false,
  regions,
  limit,
}: CreateQuizzParams): QuizzQuestion[] {
  validateQuizzFormats({ acceptedQuestionFormats, acceptedAnswerFormats });

  if (isAdaptiveDifficultySelectionEnabled) {
    return createAdaptiveQuizz({
      acceptedAnswerFormats,
      acceptedQuestionFormats,
      adaptiveHistoryEntries,
      limit,
      regions,
    });
  }

  const regionCountries = getQuizzCountries({ regions });
  const shuffledCountries = shuffle([...regionCountries]);
  const limitedCountries =
    limit === undefined ? shuffledCountries : shuffledCountries.slice(0, limit);

  return limitedCountries.map((country) =>
    createQuizzQuestion({
      country,
      acceptedQuestionFormats,
      acceptedAnswerFormats,
    }),
  );
}

interface CreateAdaptiveQuizzParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[];
  limit?: number;
  regions: readonly MapRegionName[];
}

function createAdaptiveQuizz({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  adaptiveHistoryEntries,
  limit,
  regions,
}: CreateAdaptiveQuizzParams): QuizzQuestion[] {
  const adaptiveHistoryByPracticeItem = getAdaptiveHistoryByPracticeItem({
    adaptiveHistoryEntries,
  });
  const eligibleCountries = getQuizzCountries({ regions }).filter((country) =>
    hasEligiblePracticeItem({
      acceptedAnswerFormats,
      acceptedQuestionFormats,
      country,
    }),
  );
  const includedCountries =
    limit === undefined || limit >= eligibleCountries.length
      ? shuffle([...eligibleCountries])
      : pickLimitedAdaptiveCountries({
          acceptedAnswerFormats,
          acceptedQuestionFormats,
          adaptiveHistoryByPracticeItem,
          countries: eligibleCountries,
          limit,
        });

  return includedCountries.flatMap((country) => {
    const practiceItem = pickAdaptivePracticeItemForCountry({
      acceptedAnswerFormats,
      acceptedQuestionFormats,
      adaptiveHistoryByPracticeItem,
      country,
    });

    if (practiceItem === undefined) {
      return [];
    }

    return [practiceItem];
  });
}

type AdaptiveHistoryByPracticeItem = Readonly<
  Record<string, AdaptivePracticeItemAggregate | undefined>
>;

interface GetAdaptiveHistoryByPracticeItemParams {
  adaptiveHistoryEntries: readonly AdaptiveHistoryEntry[];
}

function getAdaptiveHistoryByPracticeItem({
  adaptiveHistoryEntries,
}: GetAdaptiveHistoryByPracticeItemParams): AdaptiveHistoryByPracticeItem {
  return Object.fromEntries(
    adaptiveHistoryEntries.map((entry) => [
      getPracticeItemKey({
        answerFormat: entry.answerFormat,
        countryCode: entry.countryCode,
        questionFormat: entry.questionFormat,
      }),
      {
        failureCount: entry.failureCount,
        successCount: entry.successCount,
      },
    ]),
  );
}

interface HasEligiblePracticeItemParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  country: Country;
}

function hasEligiblePracticeItem({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  country,
}: HasEligiblePracticeItemParams): boolean {
  return (
    getEligiblePracticeItemsForCountry({
      acceptedAnswerFormats,
      acceptedQuestionFormats,
      country,
    }).length > 0
  );
}

interface PickLimitedAdaptiveCountriesParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  adaptiveHistoryByPracticeItem: AdaptiveHistoryByPracticeItem;
  countries: readonly Country[];
  limit: number;
}

function pickLimitedAdaptiveCountries({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  adaptiveHistoryByPracticeItem,
  countries,
  limit,
}: PickLimitedAdaptiveCountriesParams): Country[] {
  return Array.from({ length: limit }).reduce<Country[]>(
    (selectedCountries) => {
      const selectedCountryCodes = new Set(
        selectedCountries.map((country) => country.code),
      );
      const remainingCountries = countries.filter(
        (country) => !selectedCountryCodes.has(country.code),
      );
      const country = pickAdaptiveWeightedRandomItem({
        getWeight: (candidateCountry) =>
          getCountryAdaptiveInclusionWeight({
            acceptedAnswerFormats,
            acceptedQuestionFormats,
            adaptiveHistoryByPracticeItem,
            country: candidateCountry,
          }),
        items: remainingCountries,
      });

      if (country === undefined) {
        return selectedCountries;
      }

      return [...selectedCountries, country];
    },
    [],
  );
}

interface GetCountryAdaptiveInclusionWeightParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  adaptiveHistoryByPracticeItem: AdaptiveHistoryByPracticeItem;
  country: Country;
}

function getCountryAdaptiveInclusionWeight({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  adaptiveHistoryByPracticeItem,
  country,
}: GetCountryAdaptiveInclusionWeightParams): number {
  const practiceItems = getEligiblePracticeItemsForCountry({
    acceptedAnswerFormats,
    acceptedQuestionFormats,
    country,
  });
  const weights = practiceItems.map((practiceItem) =>
    getPracticeItemAdaptiveWeight({
      adaptiveHistoryByPracticeItem,
      practiceItem,
    }),
  );

  return weights.reduce((highestWeight, weight) => {
    return Math.max(highestWeight, weight);
  }, 0);
}

interface PickAdaptivePracticeItemForCountryParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  adaptiveHistoryByPracticeItem: AdaptiveHistoryByPracticeItem;
  country: Country;
}

function pickAdaptivePracticeItemForCountry({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  adaptiveHistoryByPracticeItem,
  country,
}: PickAdaptivePracticeItemForCountryParams): PracticeItem | undefined {
  const practiceItems = getEligiblePracticeItemsForCountry({
    acceptedAnswerFormats,
    acceptedQuestionFormats,
    country,
  });

  return pickAdaptiveWeightedRandomItem({
    getWeight: (practiceItem) =>
      getPracticeItemAdaptiveWeight({
        adaptiveHistoryByPracticeItem,
        practiceItem,
      }),
    items: practiceItems,
  });
}

interface GetPracticeItemAdaptiveWeightParams {
  adaptiveHistoryByPracticeItem: AdaptiveHistoryByPracticeItem;
  practiceItem: PracticeItem;
}

function getPracticeItemAdaptiveWeight({
  adaptiveHistoryByPracticeItem,
  practiceItem,
}: GetPracticeItemAdaptiveWeightParams): number {
  const aggregate = adaptiveHistoryByPracticeItem[
    getPracticeItemKey({
      answerFormat: practiceItem.answerFormat,
      countryCode: practiceItem.countryCode,
      questionFormat: practiceItem.questionFormat,
    })
  ] ?? { failureCount: 0, successCount: 0 };

  return getAdaptiveItemWeight({ aggregate });
}

interface GetPracticeItemKeyParams {
  answerFormat: QuizzFormat;
  countryCode: string;
  questionFormat: QuizzFormat;
}

function getPracticeItemKey({
  answerFormat,
  countryCode,
  questionFormat,
}: GetPracticeItemKeyParams): string {
  return [countryCode, questionFormat, answerFormat].join(":");
}

interface CreateWeightedRandomQuizzQuestionParams {
  adaptiveHistoryEntries?: readonly AdaptiveHistoryEntry[];
  countryQuestionCounts: CountryQuestionCounts;
  isAdaptiveDifficultySelectionEnabled?: boolean;
  options: QuizzOptions;
}

export function createWeightedRandomQuizzQuestion({
  adaptiveHistoryEntries = [],
  countryQuestionCounts,
  isAdaptiveDifficultySelectionEnabled = false,
  options,
}: CreateWeightedRandomQuizzQuestionParams): QuizzQuestion | null {
  validateQuizzFormats({
    acceptedAnswerFormats: options.acceptedAnswerFormats,
    acceptedQuestionFormats: options.acceptedQuestionFormats,
  });

  const adaptiveHistoryByPracticeItem = getAdaptiveHistoryByPracticeItem({
    adaptiveHistoryEntries,
  });
  const regionCountries = getQuizzCountries({ regions: options.regions });
  const eligibleCountries = regionCountries.filter((country) =>
    hasEligiblePracticeItem({
      acceptedAnswerFormats: options.acceptedAnswerFormats,
      acceptedQuestionFormats: options.acceptedQuestionFormats,
      country,
    }),
  );
  const country = pickWeightedRandomCountry({
    acceptedAnswerFormats: options.acceptedAnswerFormats,
    acceptedQuestionFormats: options.acceptedQuestionFormats,
    adaptiveHistoryByPracticeItem,
    countries: eligibleCountries,
    countryQuestionCounts,
    isAdaptiveDifficultySelectionEnabled,
  });

  if (country === undefined) {
    return null;
  }

  if (isAdaptiveDifficultySelectionEnabled) {
    return (
      pickAdaptivePracticeItemForCountry({
        acceptedAnswerFormats: options.acceptedAnswerFormats,
        acceptedQuestionFormats: options.acceptedQuestionFormats,
        adaptiveHistoryByPracticeItem,
        country,
      }) ?? null
    );
  }

  return createQuizzQuestion({
    acceptedAnswerFormats: options.acceptedAnswerFormats,
    acceptedQuestionFormats: options.acceptedQuestionFormats,
    country,
  });
}

interface GetQuizzCountriesParams {
  regions: readonly MapRegionName[];
}

function getQuizzCountries({ regions }: GetQuizzCountriesParams): Country[] {
  return COUNTRIES.filter((country) =>
    regions.some((region) => country.regions.includes(region)),
  );
}

interface PickWeightedRandomCountryParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  adaptiveHistoryByPracticeItem: AdaptiveHistoryByPracticeItem;
  countries: readonly Country[];
  countryQuestionCounts: CountryQuestionCounts;
  isAdaptiveDifficultySelectionEnabled: boolean;
}

function pickWeightedRandomCountry({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  adaptiveHistoryByPracticeItem,
  countries,
  countryQuestionCounts,
  isAdaptiveDifficultySelectionEnabled,
}: PickWeightedRandomCountryParams): Country | undefined {
  const weightedCountries = countries.map((country) => ({
    country,
    weight: getCountryQuestionWeight({
      acceptedAnswerFormats,
      acceptedQuestionFormats,
      adaptiveHistoryByPracticeItem,
      country,
      countryQuestionCounts,
      isAdaptiveDifficultySelectionEnabled,
    }),
  }));
  const totalWeight = weightedCountries.reduce(
    (sum, weightedCountry) => sum + weightedCountry.weight,
    0,
  );
  const targetWeight = Math.random() * totalWeight;
  let currentWeight = 0;

  return (
    weightedCountries.find((weightedCountry) => {
      currentWeight += weightedCountry.weight;

      return currentWeight >= targetWeight;
    })?.country ?? weightedCountries.at(-1)?.country
  );
}

interface GetCountryQuestionWeightParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  adaptiveHistoryByPracticeItem: AdaptiveHistoryByPracticeItem;
  country: Country;
  countryQuestionCounts: CountryQuestionCounts;
  isAdaptiveDifficultySelectionEnabled: boolean;
}

function getCountryQuestionWeight({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  adaptiveHistoryByPracticeItem,
  country,
  countryQuestionCounts,
  isAdaptiveDifficultySelectionEnabled,
}: GetCountryQuestionWeightParams): number {
  const questionCount = countryQuestionCounts[country.code] ?? 0;
  const repeatDampeningWeight = 1 / (questionCount + 1);

  if (!isAdaptiveDifficultySelectionEnabled) {
    return repeatDampeningWeight;
  }

  return (
    repeatDampeningWeight *
    getCountryAdaptiveInclusionWeight({
      acceptedAnswerFormats,
      acceptedQuestionFormats,
      adaptiveHistoryByPracticeItem,
      country,
    })
  );
}

interface ValidateQuizzFormatsParams {
  acceptedQuestionFormats: readonly QuizzFormat[];
  acceptedAnswerFormats: readonly QuizzFormat[];
}

function validateQuizzFormats({
  acceptedQuestionFormats,
  acceptedAnswerFormats,
}: ValidateQuizzFormatsParams): void {
  const firstQuestionFormat = acceptedQuestionFormats.at(0);
  const firstAnswerFormat = acceptedAnswerFormats.at(0);

  if (
    acceptedQuestionFormats.length === 0 ||
    acceptedAnswerFormats.length === 0 ||
    firstQuestionFormat === undefined ||
    firstAnswerFormat === undefined
  ) {
    throw new Error("Accepted question and answer formats cannot be empty");
  }

  if (
    hasQuizzFormatConflict({ acceptedQuestionFormats, acceptedAnswerFormats })
  ) {
    throw new Error("Question and answer formats cannot be the same");
  }
}

interface HasQuizzFormatConflictParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
}

export function hasQuizzFormatConflict({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
}: HasQuizzFormatConflictParams) {
  const hasCompatiblePair = hasQuizzFormatPair({
    acceptedAnswerFormats,
    acceptedQuestionFormats,
  });

  return !hasCompatiblePair;
}

interface CreateQuizzQuestionParams {
  country: Country;
  acceptedQuestionFormats: readonly QuizzFormat[];
  acceptedAnswerFormats: readonly QuizzFormat[];
}

function createQuizzQuestion({
  country,
  acceptedQuestionFormats,
  acceptedAnswerFormats,
}: CreateQuizzQuestionParams): QuizzQuestion {
  const compatibleQuestionFormats = getCompatibleQuestionFormats({
    acceptedAnswerFormats,
    acceptedQuestionFormats,
  });
  const questionFormat = pickRandom(compatibleQuestionFormats);

  if (questionFormat === undefined) {
    throw new Error("Question format cannot be undefined");
  }

  const answerFormat = pickRandom(
    getCompatibleAnswerFormats({
      acceptedAnswerFormats,
      questionFormat,
    }),
  );

  if (answerFormat === undefined) {
    throw new Error("Answer format cannot be undefined");
  }

  return {
    countryCode: country.code,
    questionFormat,
    answerFormat,
  };
}

interface GetEligiblePracticeItemsForCountryParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  country: Country;
}

function getEligiblePracticeItemsForCountry({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
  country,
}: GetEligiblePracticeItemsForCountryParams): PracticeItem[] {
  return getCompatibleQuestionFormats({
    acceptedAnswerFormats,
    acceptedQuestionFormats,
  }).flatMap((questionFormat) =>
    getCompatibleAnswerFormats({
      acceptedAnswerFormats,
      questionFormat,
    }).map((answerFormat) => ({
      answerFormat,
      countryCode: country.code,
      questionFormat,
    })),
  );
}

interface HasQuizzFormatPairParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
}

function hasQuizzFormatPair({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
}: HasQuizzFormatPairParams) {
  return acceptedQuestionFormats.some((questionFormat) =>
    hasCompatibleAnswerFormat({ acceptedAnswerFormats, questionFormat }),
  );
}

interface GetCompatibleQuestionFormatsParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  acceptedQuestionFormats: readonly QuizzFormat[];
}

function getCompatibleQuestionFormats({
  acceptedAnswerFormats,
  acceptedQuestionFormats,
}: GetCompatibleQuestionFormatsParams) {
  return acceptedQuestionFormats.filter((questionFormat) =>
    hasCompatibleAnswerFormat({ acceptedAnswerFormats, questionFormat }),
  );
}

interface HasCompatibleAnswerFormatParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  questionFormat: QuizzFormat;
}

function hasCompatibleAnswerFormat({
  acceptedAnswerFormats,
  questionFormat,
}: HasCompatibleAnswerFormatParams) {
  return acceptedAnswerFormats.some(
    (answerFormat) => answerFormat !== questionFormat,
  );
}

interface GetCompatibleAnswerFormatsParams {
  acceptedAnswerFormats: readonly QuizzFormat[];
  questionFormat: QuizzFormat;
}

function getCompatibleAnswerFormats({
  acceptedAnswerFormats,
  questionFormat,
}: GetCompatibleAnswerFormatsParams) {
  return acceptedAnswerFormats.filter(
    (answerFormat) => answerFormat !== questionFormat,
  );
}
