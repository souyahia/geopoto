import { isMapRegionName, type MapRegionName } from "@geopoto/geo-data";

import {
  hasQuizzFormatConflict,
  isAnswerDifficulty,
  isQuizzFormat,
  QUIZZ_ANSWER_FORMATS,
  QUIZZ_FORMATS,
  type AnswerDifficulty,
  type QuizzFormat,
  type QuizzOptions,
} from "./quizz";

const DEFAULT_ANSWER_DIFFICULTY: AnswerDifficulty = "easy";
const DEFAULT_TRAINING_SESSION_REGION: MapRegionName = "world";

export type TrainingSessionRawParams = Record<
  string,
  readonly string[] | string | undefined
>;

interface BuildTrainingSessionSearchParamsParams {
  options: QuizzOptions;
}

export function buildTrainingSessionSearchParams({
  options,
}: BuildTrainingSessionSearchParamsParams): Record<string, string> {
  const region = options.regions.at(0) ?? DEFAULT_TRAINING_SESSION_REGION;
  const baseParams = {
    answerDifficulty: options.answerDifficulty,
    answerFormats: options.acceptedAnswerFormats.join(","),
    questionFormats: options.acceptedQuestionFormats.join(","),
    region,
  };

  if (options.isInfiniteMode) {
    return {
      ...baseParams,
      isInfiniteMode: "true",
    };
  }

  if (options.limit === undefined) {
    return baseParams;
  }

  return {
    ...baseParams,
    limit: options.limit.toString(),
  };
}

interface GetTrainingSessionOptionsFromParamsParams {
  params: TrainingSessionRawParams;
}

export function getTrainingSessionOptionsFromParams({
  params,
}: GetTrainingSessionOptionsFromParamsParams): QuizzOptions {
  const region = parseRegionParam(getStringParam(params.region));
  const acceptedQuestionFormats = parseQuizzFormatsParam({
    allowedFormats: QUIZZ_FORMATS,
    fallbackFormats: QUIZZ_FORMATS,
    value: getStringParam(params.questionFormats),
  });
  const acceptedAnswerFormats = parseQuizzFormatsParam({
    allowedFormats: QUIZZ_ANSWER_FORMATS,
    fallbackFormats: QUIZZ_ANSWER_FORMATS,
    value: getStringParam(params.answerFormats),
  });
  const isInfiniteMode = parseIsInfiniteModeParam(
    getStringParam(params.isInfiniteMode),
  );
  const parsedOptions = {
    acceptedAnswerFormats,
    acceptedQuestionFormats,
    answerDifficulty: parseAnswerDifficultyParam(
      getStringParam(params.answerDifficulty),
    ),
    isInfiniteMode,
    limit: isInfiniteMode
      ? undefined
      : parseLimitParam(getStringParam(params.limit)),
    regions: [region],
  } satisfies QuizzOptions;

  if (!hasQuizzFormatConflict(parsedOptions)) {
    return parsedOptions;
  }

  return {
    ...parsedOptions,
    acceptedAnswerFormats: QUIZZ_ANSWER_FORMATS,
  };
}

function getStringParam(value: readonly string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.at(0);
  }

  return value;
}

function parseRegionParam(value: string | undefined): MapRegionName {
  if (isMapRegionName(value)) {
    return value;
  }

  return DEFAULT_TRAINING_SESSION_REGION;
}

interface ParseQuizzFormatsParamParams {
  allowedFormats: readonly QuizzFormat[];
  fallbackFormats: readonly QuizzFormat[];
  value: string | undefined;
}

function parseQuizzFormatsParam({
  allowedFormats,
  fallbackFormats,
  value,
}: ParseQuizzFormatsParamParams): readonly QuizzFormat[] {
  if (value === undefined) {
    return fallbackFormats;
  }

  const formats = value.split(",").filter(isQuizzFormat);
  const allowedParsedFormats = formats.filter((format) =>
    allowedFormats.includes(format),
  );

  if (allowedParsedFormats.length === 0) {
    return fallbackFormats;
  }

  return allowedParsedFormats;
}

function parseAnswerDifficultyParam(
  value: string | undefined,
): AnswerDifficulty {
  if (!isAnswerDifficulty(value)) {
    return DEFAULT_ANSWER_DIFFICULTY;
  }

  return value;
}

function parseIsInfiniteModeParam(value: string | undefined): boolean {
  return value === "true";
}

function parseLimitParam(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit <= 0) {
    return undefined;
  }

  return limit;
}
