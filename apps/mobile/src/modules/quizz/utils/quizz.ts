import type { Country, MapRegionName } from "@geopoto/geo-data";
import { COUNTRIES } from "@geopoto/geo-data";

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

export interface QuizzQuestion {
  countryCode: string;
  questionFormat: QuizzFormat;
  answerFormat: QuizzFormat;
}

export interface QuizzOptions {
  regions: MapRegionName[];
  acceptedQuestionFormats: readonly QuizzFormat[];
  acceptedAnswerFormats: readonly QuizzFormat[];
  limit?: number;
}

export function isQuizzFormat(value: unknown): value is QuizzFormat {
  return QUIZZ_FORMATS.some((format) => format === value);
}

export function createQuizz({
  acceptedQuestionFormats,
  acceptedAnswerFormats,
  regions,
  limit,
}: QuizzOptions): QuizzQuestion[] {
  validateQuizzFormats({ acceptedQuestionFormats, acceptedAnswerFormats });

  const regionCountries = COUNTRIES.filter((country) =>
    regions.some((region) => country.regions.includes(region)),
  );
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
