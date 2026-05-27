import type { Country, MapRegionName } from "@geopoto/geo-data";
import { COUNTRIES } from "@geopoto/geo-data";

import { pickRandom } from "@/utils/random";

const QUIZZ_FORMATS = {
  COUNTRY_NAME: "country-name",
  COUNTRY_CAPITAL: "country-capital",
  COUNTRY_FLAG: "country-flag",
  COUNTRY_MAP: "country-position",
} as const;

export type QuizzFormat = (typeof QUIZZ_FORMATS)[keyof typeof QUIZZ_FORMATS];

export interface QuizzQuestion {
  countryCode: string;
  questionFormat: QuizzFormat;
  answerFormat: QuizzFormat;
}

export interface QuizzOptions {
  regions: MapRegionName[];
  acceptedQuestionFormats: QuizzFormat[];
  acceptedAnswerFormats: QuizzFormat[];
  limit?: number;
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
  const slicedCountries = limit
    ? regionCountries.slice(0, limit)
    : regionCountries;
  const shuffledCountries = slicedCountries.sort(() => Math.random() - 0.5);

  return shuffledCountries.map((country) =>
    createQuizzQuestion({
      country,
      acceptedQuestionFormats,
      acceptedAnswerFormats,
    }),
  );
}

interface ValidateQuizzFormatsParams {
  acceptedQuestionFormats: QuizzFormat[];
  acceptedAnswerFormats: QuizzFormat[];
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
    !firstQuestionFormat ||
    !firstAnswerFormat
  ) {
    throw new Error("Accepted question and answer formats cannot be empty");
  }

  if (
    acceptedQuestionFormats.length === 1 &&
    acceptedAnswerFormats.length === 1 &&
    firstQuestionFormat === firstAnswerFormat
  ) {
    throw new Error("Question and answer formats cannot be the same");
  }
}

interface CreateQuizzQuestionParams {
  country: Country;
  acceptedQuestionFormats: QuizzFormat[];
  acceptedAnswerFormats: QuizzFormat[];
}

function createQuizzQuestion({
  country,
  acceptedQuestionFormats,
  acceptedAnswerFormats,
}: CreateQuizzQuestionParams): QuizzQuestion {
  const questionFormat = pickRandom(acceptedQuestionFormats);

  if (!questionFormat) {
    throw new Error("Question format cannot be undefined");
  }

  const answerFormat = pickRandom(
    acceptedAnswerFormats.filter((format) => format !== questionFormat),
  );

  if (!answerFormat) {
    throw new Error("Answer format cannot be undefined");
  }

  return {
    countryCode: country.code,
    questionFormat,
    answerFormat,
  };
}
